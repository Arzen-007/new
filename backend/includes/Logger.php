<?php
/**
 * Modern Green Eco CTF Platform
 * Comprehensive Logging and Error Handling
 * 
 * This class provides structured logging, error handling, and monitoring
 * for all platform activities with security event tracking.
 */

class Logger {
    private $db;
    private $logPath;
    private $maxLogSize;
    private $logRetentionDays;

    // Log levels
    const LEVEL_DEBUG = 1;
    const LEVEL_INFO = 2;
    const LEVEL_WARNING = 3;
    const LEVEL_ERROR = 4;
    const LEVEL_CRITICAL = 5;

    // Event categories
    const CATEGORY_AUTH = 'authentication';
    const CATEGORY_CHALLENGE = 'challenge';
    const CATEGORY_SUBMISSION = 'submission';
    const CATEGORY_ADMIN = 'admin';
    const CATEGORY_SECURITY = 'security';
    const CATEGORY_FILE = 'file';
    const CATEGORY_API = 'api';
    const CATEGORY_SYSTEM = 'system';

    public function __construct() {
        $this->db = Database::getInstance();
        $this->logPath = $_ENV['LOG_PATH'] ?? '/home/ubuntu/complete-ctf-platform/backend/logs/';
        $this->maxLogSize = 10 * 1024 * 1024; // 10MB
        $this->logRetentionDays = 90; // 3 months
        
        $this->ensureLogDirectory();
        $this->setupErrorHandlers();
    }

    /**
     * Log an event to database and file
     */
    public function log($level, $category, $message, $data = [], $userId = null) {
        $timestamp = time();
        $logEntry = [
            'level' => $level,
            'category' => $category,
            'message' => $message,
            'user_id' => $userId ?? $_SESSION['user_id'] ?? null,
            'ip_address' => $this->getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? '',
            'data' => json_encode($data),
            'created_at' => $timestamp
        ];

        // Log to database
        try {
            $this->db->insert('system_logs', $logEntry);
        } catch (Exception $e) {
            // If database logging fails, log to file only
            $this->logToFile('database_log_failed', $e->getMessage());
        }

        // Log to file
        $this->logToFile($category, $message, $level, $data);

        // Handle critical errors
        if ($level >= self::LEVEL_CRITICAL) {
            $this->handleCriticalError($message, $data);
        }
    }

    /**
     * Log debug information
     */
    public function debug($category, $message, $data = [], $userId = null) {
        if ($_ENV['APP_DEBUG'] === 'true') {
            $this->log(self::LEVEL_DEBUG, $category, $message, $data, $userId);
        }
    }

    /**
     * Log informational events
     */
    public function info($category, $message, $data = [], $userId = null) {
        $this->log(self::LEVEL_INFO, $category, $message, $data, $userId);
    }

    /**
     * Log warnings
     */
    public function warning($category, $message, $data = [], $userId = null) {
        $this->log(self::LEVEL_WARNING, $category, $message, $data, $userId);
    }

    /**
     * Log errors
     */
    public function error($category, $message, $data = [], $userId = null) {
        $this->log(self::LEVEL_ERROR, $category, $message, $data, $userId);
    }

    /**
     * Log critical errors
     */
    public function critical($category, $message, $data = [], $userId = null) {
        $this->log(self::LEVEL_CRITICAL, $category, $message, $data, $userId);
    }

    /**
     * Log authentication events
     */
    public function logAuth($event, $userId = null, $data = []) {
        $this->info(self::CATEGORY_AUTH, $event, $data, $userId);
    }

    /**
     * Log challenge events
     */
    public function logChallenge($event, $challengeId = null, $userId = null, $data = []) {
        $data['challenge_id'] = $challengeId;
        $this->info(self::CATEGORY_CHALLENGE, $event, $data, $userId);
    }

    /**
     * Log submission events
     */
    public function logSubmission($event, $submissionId = null, $userId = null, $data = []) {
        $data['submission_id'] = $submissionId;
        $this->info(self::CATEGORY_SUBMISSION, $event, $data, $userId);
    }

    /**
     * Log admin events
     */
    public function logAdmin($event, $userId = null, $data = []) {
        $this->info(self::CATEGORY_ADMIN, $event, $data, $userId);
    }

    /**
     * Log security events
     */
    public function logSecurity($event, $userId = null, $data = []) {
        $this->warning(self::CATEGORY_SECURITY, $event, $data, $userId);
    }

    /**
     * Log API requests
     */
    public function logApiRequest($endpoint, $method, $responseCode, $responseTime, $userId = null) {
        $data = [
            'endpoint' => $endpoint,
            'method' => $method,
            'response_code' => $responseCode,
            'response_time_ms' => $responseTime,
            'request_size' => $_SERVER['CONTENT_LENGTH'] ?? 0
        ];

        $level = $responseCode >= 500 ? self::LEVEL_ERROR : 
                ($responseCode >= 400 ? self::LEVEL_WARNING : self::LEVEL_INFO);

        $this->log($level, self::CATEGORY_API, "API request: {$method} {$endpoint}", $data, $userId);
    }

    /**
     * Get recent logs for admin panel
     */
    public function getRecentLogs($limit = 100, $category = null, $level = null) {
        $sql = "SELECT * FROM system_logs WHERE 1=1";
        $params = [];

        if ($category) {
            $sql .= " AND category = :category";
            $params['category'] = $category;
        }

        if ($level) {
            $sql .= " AND level >= :level";
            $params['level'] = $level;
        }

        $sql .= " ORDER BY created_at DESC LIMIT :limit";
        $params['limit'] = $limit;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Get log statistics
     */
    public function getLogStats($hours = 24) {
        $cutoff = time() - ($hours * 3600);
        
        $stats = $this->db->fetchAll(
            "SELECT category, level, COUNT(*) as count 
             FROM system_logs 
             WHERE created_at > :cutoff 
             GROUP BY category, level 
             ORDER BY category, level",
            ['cutoff' => $cutoff]
        );

        $organized = [];
        foreach ($stats as $stat) {
            $organized[$stat['category']][$stat['level']] = $stat['count'];
        }

        return $organized;
    }

    /**
     * Clean old logs
     */
    public function cleanOldLogs() {
        $cutoff = time() - ($this->logRetentionDays * 24 * 3600);
        
        $deleted = $this->db->query(
            "DELETE FROM system_logs WHERE created_at < :cutoff",
            ['cutoff' => $cutoff]
        )->rowCount();

        $this->info(self::CATEGORY_SYSTEM, "Cleaned old logs", ['deleted_count' => $deleted]);
        
        return $deleted;
    }

    /**
     * Log to file
     */
    private function logToFile($category, $message, $level = self::LEVEL_INFO, $data = []) {
        $levelNames = [
            self::LEVEL_DEBUG => 'DEBUG',
            self::LEVEL_INFO => 'INFO',
            self::LEVEL_WARNING => 'WARNING',
            self::LEVEL_ERROR => 'ERROR',
            self::LEVEL_CRITICAL => 'CRITICAL'
        ];

        $timestamp = date('Y-m-d H:i:s');
        $levelName = $levelNames[$level] ?? 'UNKNOWN';
        $ip = $this->getClientIp();
        $userId = $_SESSION['user_id'] ?? 'anonymous';

        $logLine = sprintf(
            "[%s] %s.%s: %s (User: %s, IP: %s)",
            $timestamp,
            $levelName,
            strtoupper($category),
            $message,
            $userId,
            $ip
        );

        if (!empty($data)) {
            $logLine .= " Data: " . json_encode($data);
        }

        $logLine .= "\n";

        // Determine log file
        $logFile = $this->logPath . date('Y-m-d') . '.log';
        
        // Rotate log if too large
        if (file_exists($logFile) && filesize($logFile) > $this->maxLogSize) {
            $this->rotateLogFile($logFile);
        }

        // Write to log file
        file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
    }

    /**
     * Rotate log file
     */
    private function rotateLogFile($logFile) {
        $rotatedFile = $logFile . '.' . time();
        rename($logFile, $rotatedFile);
        
        // Compress old log file
        if (function_exists('gzencode')) {
            $content = file_get_contents($rotatedFile);
            file_put_contents($rotatedFile . '.gz', gzencode($content));
            unlink($rotatedFile);
        }
    }

    /**
     * Handle critical errors
     */
    private function handleCriticalError($message, $data = []) {
        // Send email notification if configured
        if (!empty($_ENV['ADMIN_EMAIL'])) {
            $this->sendCriticalErrorEmail($message, $data);
        }

        // Log to system error log
        error_log("CRITICAL ERROR: {$message} " . json_encode($data));
    }

    /**
     * Send critical error email
     */
    private function sendCriticalErrorEmail($message, $data) {
        $subject = "Critical Error - CTF Platform";
        $body = "A critical error occurred on the CTF platform:\n\n";
        $body .= "Message: {$message}\n";
        $body .= "Time: " . date('Y-m-d H:i:s') . "\n";
        $body .= "IP: " . $this->getClientIp() . "\n";
        $body .= "User: " . ($_SESSION['user_id'] ?? 'anonymous') . "\n";
        $body .= "Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";

        $headers = "From: noreply@ctfplatform.com\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        mail($_ENV['ADMIN_EMAIL'], $subject, $body, $headers);
    }

    /**
     * Setup error handlers
     */
    private function setupErrorHandlers() {
        // Set custom error handler
        set_error_handler([$this, 'handlePhpError']);
        
        // Set custom exception handler
        set_exception_handler([$this, 'handleUncaughtException']);
        
        // Set shutdown function to catch fatal errors
        register_shutdown_function([$this, 'handleShutdown']);
    }

    /**
     * Handle PHP errors
     */
    public function handlePhpError($severity, $message, $file, $line) {
        $errorTypes = [
            E_ERROR => 'ERROR',
            E_WARNING => 'WARNING',
            E_PARSE => 'PARSE ERROR',
            E_NOTICE => 'NOTICE',
            E_CORE_ERROR => 'CORE ERROR',
            E_CORE_WARNING => 'CORE WARNING',
            E_COMPILE_ERROR => 'COMPILE ERROR',
            E_COMPILE_WARNING => 'COMPILE WARNING',
            E_USER_ERROR => 'USER ERROR',
            E_USER_WARNING => 'USER WARNING',
            E_USER_NOTICE => 'USER NOTICE',
            E_STRICT => 'STRICT',
            E_RECOVERABLE_ERROR => 'RECOVERABLE ERROR',
            E_DEPRECATED => 'DEPRECATED',
            E_USER_DEPRECATED => 'USER DEPRECATED'
        ];

        $errorType = $errorTypes[$severity] ?? 'UNKNOWN';
        $logMessage = "{$errorType}: {$message} in {$file} on line {$line}";

        $level = in_array($severity, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR]) 
            ? self::LEVEL_ERROR 
            : self::LEVEL_WARNING;

        $this->log($level, self::CATEGORY_SYSTEM, $logMessage, [
            'severity' => $severity,
            'file' => $file,
            'line' => $line
        ]);

        // Don't execute PHP internal error handler
        return true;
    }

    /**
     * Handle uncaught exceptions
     */
    public function handleUncaughtException($exception) {
        $message = "Uncaught exception: " . $exception->getMessage();
        
        $this->critical(self::CATEGORY_SYSTEM, $message, [
            'exception_class' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);
    }

    /**
     * Handle shutdown errors
     */
    public function handleShutdown() {
        $error = error_get_last();
        
        if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $message = "Fatal error: {$error['message']} in {$error['file']} on line {$error['line']}";
            
            $this->critical(self::CATEGORY_SYSTEM, $message, [
                'error_type' => $error['type'],
                'file' => $error['file'],
                'line' => $error['line']
            ]);
        }
    }

    /**
     * Ensure log directory exists
     */
    private function ensureLogDirectory() {
        if (!is_dir($this->logPath)) {
            mkdir($this->logPath, 0755, true);
        }

        // Secure log directory
        $htaccessPath = $this->logPath . '.htaccess';
        if (!file_exists($htaccessPath)) {
            file_put_contents($htaccessPath, "Deny from all\n");
        }
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
}

// Global logger instance
function logger() {
    static $instance = null;
    if ($instance === null) {
        $instance = new Logger();
    }
    return $instance;
}

