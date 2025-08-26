<?php
/**
 * Modern Green Eco CTF Platform
 * Secure File Upload and Management
 * 
 * This class provides secure file upload, storage, and management
 * for challenge assets and user submissions with comprehensive security measures.
 */

require_once 'Validator.php';

class FileManager {
    private $db;
    private $uploadPath;
    private $maxFileSize;
    private $allowedTypes;
    private $quarantinePath;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->uploadPath = $_ENV['UPLOAD_PATH'] ?? '/home/ubuntu/complete-ctf-platform/backend/uploads/';
        $this->quarantinePath = $_ENV['QUARANTINE_PATH'] ?? '/home/ubuntu/complete-ctf-platform/backend/quarantine/';
        $this->maxFileSize = 50 * 1024 * 1024; // 50MB
        
        // Allowed MIME types for different file categories
        $this->allowedTypes = [
            'challenge' => [
                'application/zip',
                'application/x-zip-compressed',
                'application/pdf',
                'text/plain',
                'application/octet-stream',
                'image/png',
                'image/jpeg',
                'image/gif'
            ],
            'image' => [
                'image/png',
                'image/jpeg',
                'image/gif',
                'image/webp'
            ],
            'document' => [
                'application/pdf',
                'text/plain',
                'text/markdown'
            ]
        ];

        $this->ensureDirectories();
    }

    /**
     * Upload a file securely
     */
    public function uploadFile($file, $challengeId = null, $category = 'challenge') {
        // Validate file upload
        Validator::validateFileUpload($file, $this->allowedTypes[$category] ?? [], $this->maxFileSize);

        // Generate secure filename
        $originalName = Validator::sanitizeFilename($file['name']);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $secureFilename = $this->generateSecureFilename($originalName);
        
        // Create subdirectory based on challenge ID or date
        $subDir = $challengeId ? "challenge_{$challengeId}" : date('Y/m');
        $targetDir = $this->uploadPath . $subDir . '/';
        $this->ensureDirectory($targetDir);
        
        $targetPath = $targetDir . $secureFilename;

        // Perform security checks
        $this->performSecurityChecks($file['tmp_name'], $originalName);

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Failed to move uploaded file');
        }

        // Set secure permissions
        chmod($targetPath, 0644);

        // Calculate file hash for integrity
        $fileHash = hash_file('sha256', $targetPath);
        $fileSize = filesize($targetPath);

        // Generate download key
        $downloadKey = bin2hex(random_bytes(32));

        // Store file information in database
        $fileId = $this->db->insert('files', [
            'challenge_id' => $challengeId,
            'original_name' => $originalName,
            'secure_filename' => $secureFilename,
            'file_path' => $subDir . '/' . $secureFilename,
            'file_size' => $fileSize,
            'file_hash' => $fileHash,
            'mime_type' => $this->getSecureMimeType($targetPath),
            'download_key' => $downloadKey,
            'category' => $category,
            'uploaded_by' => $_SESSION['user_id'] ?? null,
            'upload_ip' => $this->getClientIp(),
            'created_at' => time()
        ]);

        // Log file upload
        $this->logFileEvent('file_uploaded', $fileId, [
            'original_name' => $originalName,
            'file_size' => $fileSize,
            'challenge_id' => $challengeId
        ]);

        return [
            'file_id' => $fileId,
            'download_key' => $downloadKey,
            'original_name' => $originalName,
            'file_size' => $fileSize,
            'file_hash' => $fileHash
        ];
    }

    /**
     * Download a file securely
     */
    public function downloadFile($downloadKey, $userId = null) {
        // Get file information
        $file = $this->db->fetchOne(
            "SELECT f.*, c.available_from, c.title as challenge_title 
             FROM files f 
             LEFT JOIN challenges c ON c.id = f.challenge_id 
             WHERE f.download_key = :download_key",
            ['download_key' => $downloadKey]
        );

        if (!$file) {
            throw new Exception('File not found');
        }

        // Check if file is available
        if ($file['available_from'] && time() < $file['available_from'] && !$this->isStaff($userId)) {
            throw new Exception('File not yet available');
        }

        // Verify file integrity
        $fullPath = $this->uploadPath . $file['file_path'];
        
        if (!file_exists($fullPath)) {
            throw new Exception('File not found on disk');
        }

        $currentHash = hash_file('sha256', $fullPath);
        if ($currentHash !== $file['file_hash']) {
            $this->quarantineFile($fullPath, 'integrity_check_failed');
            throw new Exception('File integrity check failed');
        }

        // Log download
        $this->logFileEvent('file_downloaded', $file['id'], [
            'user_id' => $userId,
            'challenge_id' => $file['challenge_id']
        ]);

        // Update download count
        $this->db->query(
            "UPDATE files SET download_count = download_count + 1, last_downloaded = :now WHERE id = :id",
            ['now' => time(), 'id' => $file['id']]
        );

        return [
            'file_path' => $fullPath,
            'original_name' => $file['original_name'],
            'mime_type' => $file['mime_type'],
            'file_size' => $file['file_size']
        ];
    }

    /**
     * Delete a file securely
     */
    public function deleteFile($fileId, $userId) {
        // Check permissions
        if (!$this->isStaff($userId)) {
            throw new Exception('Insufficient permissions');
        }

        $file = $this->db->fetchOne(
            "SELECT * FROM files WHERE id = :id",
            ['id' => $fileId]
        );

        if (!$file) {
            throw new Exception('File not found');
        }

        $fullPath = $this->uploadPath . $file['file_path'];

        // Secure deletion
        if (file_exists($fullPath)) {
            // Overwrite file with random data before deletion
            $this->secureDelete($fullPath);
        }

        // Remove from database
        $this->db->delete('files', ['id' => $fileId]);

        // Log deletion
        $this->logFileEvent('file_deleted', $fileId, [
            'user_id' => $userId,
            'original_name' => $file['original_name']
        ]);

        return true;
    }

    /**
     * Get files for a challenge
     */
    public function getChallengeFiles($challengeId) {
        return $this->db->fetchAll(
            "SELECT id, original_name, file_size, download_key, created_at 
             FROM files 
             WHERE challenge_id = :challenge_id 
             ORDER BY created_at ASC",
            ['challenge_id' => $challengeId]
        );
    }

    /**
     * Perform comprehensive security checks on uploaded file
     */
    private function performSecurityChecks($tempPath, $originalName) {
        // Check file size
        $fileSize = filesize($tempPath);
        if ($fileSize > $this->maxFileSize) {
            throw new Exception('File too large');
        }

        // Verify MIME type
        $mimeType = $this->getSecureMimeType($tempPath);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        // Check for dangerous extensions
        $dangerousExtensions = [
            'php', 'php3', 'php4', 'php5', 'phtml', 'asp', 'aspx', 'jsp', 'js', 'vbs', 'bat', 'cmd', 'com', 'exe', 'scr'
        ];

        if (in_array($extension, $dangerousExtensions)) {
            throw new Exception('File type not allowed');
        }

        // Check for embedded PHP code
        $content = file_get_contents($tempPath, false, null, 0, 8192); // Read first 8KB
        if (preg_match('/<\?php|<\?=|<script/i', $content)) {
            $this->quarantineFile($tempPath, 'malicious_content_detected');
            throw new Exception('Malicious content detected');
        }

        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/shell_exec\s*\(/i',
            '/passthru\s*\(/i',
            '/base64_decode\s*\(/i'
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                $this->quarantineFile($tempPath, 'suspicious_pattern_detected');
                throw new Exception('Suspicious content detected');
            }
        }

        // Additional checks for specific file types
        if ($mimeType === 'application/zip') {
            $this->checkZipFile($tempPath);
        }

        return true;
    }

    /**
     * Check ZIP file for security issues
     */
    private function checkZipFile($filePath) {
        $zip = new ZipArchive();
        
        if ($zip->open($filePath) !== TRUE) {
            throw new Exception('Invalid ZIP file');
        }

        $maxFiles = 1000;
        $maxTotalSize = 100 * 1024 * 1024; // 100MB uncompressed
        $totalSize = 0;

        for ($i = 0; $i < $zip->numFiles; $i++) {
            if ($i > $maxFiles) {
                $zip->close();
                throw new Exception('ZIP file contains too many files');
            }

            $stat = $zip->statIndex($i);
            $totalSize += $stat['size'];

            if ($totalSize > $maxTotalSize) {
                $zip->close();
                throw new Exception('ZIP file too large when uncompressed');
            }

            // Check for directory traversal
            if (strpos($stat['name'], '../') !== false || strpos($stat['name'], '..\\') !== false) {
                $zip->close();
                throw new Exception('ZIP file contains directory traversal');
            }

            // Check for dangerous filenames
            $filename = basename($stat['name']);
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            $dangerousExtensions = ['php', 'asp', 'jsp', 'exe', 'bat', 'cmd'];
            if (in_array($extension, $dangerousExtensions)) {
                $zip->close();
                throw new Exception('ZIP file contains dangerous file types');
            }
        }

        $zip->close();
        return true;
    }

    /**
     * Generate secure filename
     */
    private function generateSecureFilename($originalName) {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize basename
        $basename = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $basename);
        $basename = substr($basename, 0, 50); // Limit length
        
        // Add timestamp and random component
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        
        return "{$basename}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Get secure MIME type
     */
    private function getSecureMimeType($filePath) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);
        
        // Fallback to file extension if finfo fails
        if (!$mimeType) {
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $mimeTypes = [
                'zip' => 'application/zip',
                'pdf' => 'application/pdf',
                'txt' => 'text/plain',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif'
            ];
            
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        }
        
        return $mimeType;
    }

    /**
     * Quarantine suspicious file
     */
    private function quarantineFile($filePath, $reason) {
        $quarantineFile = $this->quarantinePath . basename($filePath) . '_' . time();
        
        if (file_exists($filePath)) {
            copy($filePath, $quarantineFile);
            
            // Log quarantine event
            $this->logFileEvent('file_quarantined', null, [
                'original_path' => $filePath,
                'quarantine_path' => $quarantineFile,
                'reason' => $reason
            ]);
        }
    }

    /**
     * Secure file deletion
     */
    private function secureDelete($filePath) {
        if (!file_exists($filePath)) {
            return;
        }

        $fileSize = filesize($filePath);
        $handle = fopen($filePath, 'r+');
        
        if ($handle) {
            // Overwrite with random data
            fseek($handle, 0);
            fwrite($handle, random_bytes($fileSize));
            fflush($handle);
            fclose($handle);
        }
        
        unlink($filePath);
    }

    /**
     * Ensure directory exists with secure permissions
     */
    private function ensureDirectory($path) {
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
        
        // Ensure no web access
        $htaccessPath = $path . '.htaccess';
        if (!file_exists($htaccessPath)) {
            file_put_contents($htaccessPath, "Deny from all\n");
        }
    }

    /**
     * Ensure required directories exist
     */
    private function ensureDirectories() {
        $this->ensureDirectory($this->uploadPath);
        $this->ensureDirectory($this->quarantinePath);
    }

    /**
     * Check if user is staff
     */
    private function isStaff($userId) {
        if (!$userId) {
            return false;
        }

        $user = $this->db->fetchOne(
            "SELECT role FROM users WHERE id = :id",
            ['id' => $userId]
        );

        return $user && $user['role'] >= AuthManager::ROLE_MODERATOR;
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Log file-related events
     */
    private function logFileEvent($event, $fileId = null, $data = []) {
        $this->db->insert('file_logs', [
            'event' => $event,
            'file_id' => $fileId,
            'user_id' => $_SESSION['user_id'] ?? null,
            'ip_address' => $this->getClientIp(),
            'data' => json_encode($data),
            'created_at' => time()
        ]);
    }
}

