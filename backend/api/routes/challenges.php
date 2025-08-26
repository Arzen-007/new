<?php
/**
 * Modern Green Eco CTF Platform
 * Challenge Management API Routes
 * 
 * This file handles all challenge-related API endpoints
 * including CRUD operations, submissions, and file management.
 */

require_once '../../includes/AuthManager.php';
require_once '../../includes/Validator.php';
require_once '../../includes/Logger.php';
require_once '../../includes/FileManager.php';

class ChallengeAPI {
    private $auth;
    private $logger;
    private $fileManager;

    public function __construct() {
        $this->auth = new AuthManager();
        $this->logger = logger();
        $this->fileManager = new FileManager();
    }

    /**
     * Handle challenge requests
     */
    public function handleRequest($method, $endpoint, $id = null) {
        try {
            switch ($method) {
                case 'GET':
                    return $this->handleGet($endpoint, $id);
                case 'POST':
                    return $this->handlePost($endpoint, $id);
                case 'PUT':
                    return $this->handlePut($endpoint, $id);
                case 'DELETE':
                    return $this->handleDelete($endpoint, $id);
                default:
                    throw new Exception('Method not allowed');
            }
        } catch (Exception $e) {
            $this->logger->error(Logger::CATEGORY_CHALLENGE, 'API error: ' . $e->getMessage(), [
                'endpoint' => $endpoint,
                'method' => $method,
                'id' => $id
            ]);
            
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Handle GET requests
     */
    private function handleGet($endpoint, $id) {
        switch ($endpoint) {
            case 'list':
                return $this->listChallenges();
            case 'detail':
                return $this->getChallengeDetail($id);
            case 'categories':
                return $this->getCategories();
            case 'hints':
                return $this->getChallengeHints($id);
            case 'files':
                return $this->getChallengeFiles($id);
            default:
                throw new Exception('Endpoint not found');
        }
    }

    /**
     * Handle POST requests
     */
    private function handlePost($endpoint, $id) {
        switch ($endpoint) {
            case 'create':
                return $this->createChallenge();
            case 'submit':
                return $this->submitFlag($id);
            case 'upload-file':
                return $this->uploadFile($id);
            default:
                throw new Exception('Endpoint not found');
        }
    }

    /**
     * Handle PUT requests
     */
    private function handlePut($endpoint, $id) {
        switch ($endpoint) {
            case 'update':
                return $this->updateChallenge($id);
            default:
                throw new Exception('Endpoint not found');
        }
    }

    /**
     * Handle DELETE requests
     */
    private function handleDelete($endpoint, $id) {
        switch ($endpoint) {
            case 'delete':
                return $this->deleteChallenge($id);
            default:
                throw new Exception('Endpoint not found');
        }
    }

    /**
     * List all challenges
     */
    private function listChallenges() {
        $user = $this->getOptionalAuth();
        $isStaff = $user && $this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR);
        
        $sql = "SELECT c.id, c.title, c.description, c.points, c.category, c.exposed, 
                       c.available_from, c.available_until, c.created_at,
                       cat.name as category_name, cat.icon as category_icon,
                       (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND correct = 1) as solve_count";
        
        if ($user) {
            $sql .= ", (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND user_id = :user_id AND correct = 1) as user_solved";
        }
        
        $sql .= " FROM challenges c 
                  LEFT JOIN categories cat ON cat.id = c.category";
        
        if (!$isStaff) {
            $sql .= " WHERE c.exposed = 1 AND (c.available_from IS NULL OR c.available_from <= :now)
                      AND (c.available_until IS NULL OR c.available_until >= :now)";
        }
        
        $sql .= " ORDER BY c.category, c.points ASC";
        
        $params = [];
        if ($user) {
            $params['user_id'] = $user['id'];
        }
        if (!$isStaff) {
            $params['now'] = time();
        }
        
        $challenges = db_fetch_all($sql, $params);
        
        // Group by category
        $grouped = [];
        foreach ($challenges as $challenge) {
            $categoryName = $challenge['category_name'] ?? 'Uncategorized';
            if (!isset($grouped[$categoryName])) {
                $grouped[$categoryName] = [
                    'name' => $categoryName,
                    'icon' => $challenge['category_icon'] ?? '🎯',
                    'challenges' => []
                ];
            }
            $grouped[$categoryName]['challenges'][] = $challenge;
        }
        
        return $this->successResponse('Challenges retrieved', [
            'categories' => array_values($grouped)
        ]);
    }

    /**
     * Get challenge detail
     */
    private function getChallengeDetail($id) {
        $challengeId = Validator::validateId($id);
        $user = $this->getOptionalAuth();
        $isStaff = $user && $this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR);
        
        $sql = "SELECT c.*, cat.name as category_name, cat.icon as category_icon,
                       (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND correct = 1) as solve_count";
        
        if ($user) {
            $sql .= ", (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND user_id = :user_id AND correct = 1) as user_solved,
                       (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND user_id = :user_id) as user_attempts";
        }
        
        $sql .= " FROM challenges c 
                  LEFT JOIN categories cat ON cat.id = c.category 
                  WHERE c.id = :id";
        
        if (!$isStaff) {
            $sql .= " AND c.exposed = 1 AND (c.available_from IS NULL OR c.available_from <= :now)
                      AND (c.available_until IS NULL OR c.available_until >= :now)";
        }
        
        $params = ['id' => $challengeId];
        if ($user) {
            $params['user_id'] = $user['id'];
        }
        if (!$isStaff) {
            $params['now'] = time();
        }
        
        $challenge = db_fetch_one($sql, $params);
        
        if (!$challenge) {
            throw new Exception('Challenge not found or not available');
        }
        
        // Get challenge files
        $challenge['files'] = $this->fileManager->getChallengeFiles($challengeId);
        
        // Get hints if user has permission
        if ($user) {
            $challenge['hints'] = $this->getChallengeHintsData($challengeId, $user['id']);
        }
        
        $this->logger->logChallenge('challenge_viewed', $challengeId, $user['id'] ?? null);
        
        return $this->successResponse('Challenge retrieved', [
            'challenge' => $challenge
        ]);
    }

    /**
     * Submit flag for challenge
     */
    private function submitFlag($id) {
        $user = $this->requireAuth();
        $challengeId = Validator::validateId($id);
        $input = $this->getJsonInput();
        
        if (empty($input['flag'])) {
            throw new Exception('Flag is required');
        }
        
        $flag = Validator::validateFlag($input['flag']);
        
        // Get challenge
        $challenge = db_fetch_one(
            "SELECT * FROM challenges WHERE id = :id AND exposed = 1",
            ['id' => $challengeId]
        );
        
        if (!$challenge) {
            throw new Exception('Challenge not found');
        }
        
        // Check if challenge is available
        $now = time();
        if (($challenge['available_from'] && $now < $challenge['available_from']) ||
            ($challenge['available_until'] && $now > $challenge['available_until'])) {
            throw new Exception('Challenge not available');
        }
        
        // Check rate limiting
        $this->checkSubmissionRateLimit($challengeId, $user['id'], $challenge);
        
        // Check if already solved
        $existingSolve = db_fetch_one(
            "SELECT id FROM submissions WHERE challenge_id = :challenge_id AND user_id = :user_id AND correct = 1",
            ['challenge_id' => $challengeId, 'user_id' => $user['id']]
        );
        
        if ($existingSolve) {
            throw new Exception('Challenge already solved');
        }
        
        // Validate flag
        $isCorrect = $this->validateFlag($flag, $challenge);
        
        // Record submission
        $submissionId = db_insert('submissions', [
            'challenge_id' => $challengeId,
            'user_id' => $user['id'],
            'flag' => $flag,
            'correct' => $isCorrect ? 1 : 0,
            'ip_address' => $this->getClientIp(),
            'submitted_at' => time()
        ]);
        
        if ($isCorrect) {
            $this->logger->logSubmission('flag_correct', $submissionId, $user['id'], [
                'challenge_id' => $challengeId,
                'points' => $challenge['points']
            ]);
            
            return $this->successResponse('Correct flag!', [
                'correct' => true,
                'points' => $challenge['points'],
                'message' => 'Congratulations! You solved the challenge.'
            ]);
        } else {
            $this->logger->logSubmission('flag_incorrect', $submissionId, $user['id'], [
                'challenge_id' => $challengeId
            ]);
            
            return $this->successResponse('Incorrect flag', [
                'correct' => false,
                'message' => 'That\'s not the correct flag. Keep trying!'
            ]);
        }
    }

    /**
     * Create new challenge (admin only)
     */
    private function createChallenge() {
        $user = $this->requireAuth();
        
        if (!$this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR)) {
            throw new Exception('Insufficient permissions');
        }
        
        $input = $this->getJsonInput();
        
        $required = ['title', 'description', 'flag', 'points', 'category'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                throw new Exception("Field '{$field}' is required");
            }
        }
        
        $challengeData = [
            'title' => Validator::validateChallengeTitle($input['title']),
            'description' => Validator::validateChallengeDescription($input['description']),
            'flag' => Validator::validateFlag($input['flag']),
            'points' => Validator::validatePoints($input['points']),
            'category' => Validator::validateId($input['category']),
            'automark' => Validator::validateBoolean($input['automark'] ?? true),
            'case_insensitive' => Validator::validateBoolean($input['case_insensitive'] ?? false),
            'exposed' => Validator::validateBoolean($input['exposed'] ?? false),
            'available_from' => Validator::validateDateTime($input['available_from'] ?? null),
            'available_until' => Validator::validateDateTime($input['available_until'] ?? null),
            'num_attempts_allowed' => $input['num_attempts_allowed'] ?? null,
            'min_seconds_between_submissions' => $input['min_seconds_between_submissions'] ?? 30,
            'created_by' => $user['id'],
            'created_at' => time()
        ];
        
        $challengeId = db_insert('challenges', $challengeData);
        
        $this->logger->logChallenge('challenge_created', $challengeId, $user['id'], [
            'title' => $challengeData['title'],
            'points' => $challengeData['points']
        ]);
        
        return $this->successResponse('Challenge created', [
            'challenge_id' => $challengeId
        ]);
    }

    /**
     * Update challenge (admin only)
     */
    private function updateChallenge($id) {
        $user = $this->requireAuth();
        
        if (!$this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR)) {
            throw new Exception('Insufficient permissions');
        }
        
        $challengeId = Validator::validateId($id);
        $input = $this->getJsonInput();
        
        // Get existing challenge
        $existing = db_fetch_one("SELECT * FROM challenges WHERE id = :id", ['id' => $challengeId]);
        if (!$existing) {
            throw new Exception('Challenge not found');
        }
        
        $updateData = [];
        
        if (isset($input['title'])) {
            $updateData['title'] = Validator::validateChallengeTitle($input['title']);
        }
        if (isset($input['description'])) {
            $updateData['description'] = Validator::validateChallengeDescription($input['description']);
        }
        if (isset($input['flag'])) {
            $updateData['flag'] = Validator::validateFlag($input['flag']);
        }
        if (isset($input['points'])) {
            $updateData['points'] = Validator::validatePoints($input['points']);
        }
        if (isset($input['category'])) {
            $updateData['category'] = Validator::validateId($input['category']);
        }
        if (isset($input['automark'])) {
            $updateData['automark'] = Validator::validateBoolean($input['automark']);
        }
        if (isset($input['case_insensitive'])) {
            $updateData['case_insensitive'] = Validator::validateBoolean($input['case_insensitive']);
        }
        if (isset($input['exposed'])) {
            $updateData['exposed'] = Validator::validateBoolean($input['exposed']);
        }
        if (isset($input['available_from'])) {
            $updateData['available_from'] = Validator::validateDateTime($input['available_from']);
        }
        if (isset($input['available_until'])) {
            $updateData['available_until'] = Validator::validateDateTime($input['available_until']);
        }
        
        if (!empty($updateData)) {
            $updateData['updated_at'] = time();
            db_update('challenges', $updateData, ['id' => $challengeId]);
        }
        
        $this->logger->logChallenge('challenge_updated', $challengeId, $user['id'], $updateData);
        
        return $this->successResponse('Challenge updated');
    }

    /**
     * Delete challenge (admin only)
     */
    private function deleteChallenge($id) {
        $user = $this->requireAuth();
        
        if (!$this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR)) {
            throw new Exception('Insufficient permissions');
        }
        
        $challengeId = Validator::validateId($id);
        
        // Get challenge info before deletion
        $challenge = db_fetch_one("SELECT title FROM challenges WHERE id = :id", ['id' => $challengeId]);
        if (!$challenge) {
            throw new Exception('Challenge not found');
        }
        
        // Delete related data
        db_delete('submissions', ['challenge_id' => $challengeId]);
        db_delete('hints', ['challenge_id' => $challengeId]);
        db_delete('files', ['challenge_id' => $challengeId]);
        db_delete('challenges', ['id' => $challengeId]);
        
        $this->logger->logChallenge('challenge_deleted', $challengeId, $user['id'], [
            'title' => $challenge['title']
        ]);
        
        return $this->successResponse('Challenge deleted');
    }

    /**
     * Get categories
     */
    private function getCategories() {
        $categories = db_fetch_all(
            "SELECT id, name, icon, description FROM categories ORDER BY name"
        );
        
        return $this->successResponse('Categories retrieved', [
            'categories' => $categories
        ]);
    }

    /**
     * Get challenge hints
     */
    private function getChallengeHints($id) {
        $user = $this->requireAuth();
        $challengeId = Validator::validateId($id);
        
        $hints = $this->getChallengeHintsData($challengeId, $user['id']);
        
        return $this->successResponse('Hints retrieved', [
            'hints' => $hints
        ]);
    }

    /**
     * Get challenge files
     */
    private function getChallengeFiles($id) {
        $challengeId = Validator::validateId($id);
        
        $files = $this->fileManager->getChallengeFiles($challengeId);
        
        return $this->successResponse('Files retrieved', [
            'files' => $files
        ]);
    }

    /**
     * Upload file to challenge (admin only)
     */
    private function uploadFile($id) {
        $user = $this->requireAuth();
        
        if (!$this->auth->hasPermission($user['id'], AuthManager::ROLE_MODERATOR)) {
            throw new Exception('Insufficient permissions');
        }
        
        $challengeId = Validator::validateId($id);
        
        if (!isset($_FILES['file'])) {
            throw new Exception('No file uploaded');
        }
        
        $result = $this->fileManager->uploadFile($_FILES['file'], $challengeId);
        
        $this->logger->logChallenge('file_uploaded', $challengeId, $user['id'], [
            'file_name' => $result['original_name'],
            'file_size' => $result['file_size']
        ]);
        
        return $this->successResponse('File uploaded', $result);
    }

    /**
     * Validate submitted flag
     */
    private function validateFlag($submittedFlag, $challenge) {
        $correctFlag = $challenge['flag'];
        
        if ($challenge['case_insensitive']) {
            return strtolower($submittedFlag) === strtolower($correctFlag);
        }
        
        return $submittedFlag === $correctFlag;
    }

    /**
     * Check submission rate limiting
     */
    private function checkSubmissionRateLimit($challengeId, $userId, $challenge) {
        if ($challenge['min_seconds_between_submissions'] > 0) {
            $lastSubmission = db_fetch_one(
                "SELECT submitted_at FROM submissions 
                 WHERE challenge_id = :challenge_id AND user_id = :user_id 
                 ORDER BY submitted_at DESC LIMIT 1",
                ['challenge_id' => $challengeId, 'user_id' => $userId]
            );
            
            if ($lastSubmission) {
                $timeSince = time() - $lastSubmission['submitted_at'];
                if ($timeSince < $challenge['min_seconds_between_submissions']) {
                    $waitTime = $challenge['min_seconds_between_submissions'] - $timeSince;
                    throw new Exception("Please wait {$waitTime} seconds before submitting again");
                }
            }
        }
        
        if ($challenge['num_attempts_allowed']) {
            $attempts = db_count('submissions', [
                'challenge_id' => $challengeId,
                'user_id' => $userId
            ]);
            
            if ($attempts >= $challenge['num_attempts_allowed']) {
                throw new Exception('Maximum attempts exceeded for this challenge');
            }
        }
    }

    /**
     * Get challenge hints data
     */
    private function getChallengeHintsData($challengeId, $userId) {
        $hints = db_fetch_all(
            "SELECT id, hint_text, cost FROM hints 
             WHERE challenge_id = :challenge_id 
             ORDER BY cost ASC",
            ['challenge_id' => $challengeId]
        );
        
        // Check which hints user has unlocked
        foreach ($hints as &$hint) {
            $unlocked = db_fetch_one(
                "SELECT id FROM hint_unlocks 
                 WHERE hint_id = :hint_id AND user_id = :user_id",
                ['hint_id' => $hint['id'], 'user_id' => $userId]
            );
            
            $hint['unlocked'] = !empty($unlocked);
            if (!$hint['unlocked']) {
                $hint['hint_text'] = null; // Don't reveal hint text
            }
        }
        
        return $hints;
    }

    /**
     * Require authentication and return user
     */
    private function requireAuth() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            throw new Exception('Authentication required');
        }

        return $this->auth->verifyToken($token);
    }

    /**
     * Get optional authentication
     */
    private function getOptionalAuth() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            return null;
        }

        try {
            return $this->auth->verifyToken($token);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get Bearer token from Authorization header
     */
    private function getBearerToken() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }

    /**
     * Get JSON input from request body
     */
    private function getJsonInput() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON input');
        }
        
        return $input ?? [];
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
     * Return success response
     */
    private function successResponse($message, $data = null) {
        $response = [
            'success' => true,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        return $response;
    }

    /**
     * Return error response
     */
    private function errorResponse($message, $code = 400) {
        http_response_code($code);
        
        return [
            'success' => false,
            'error' => $message
        ];
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle CORS preflight
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Get endpoint and ID from URL
$endpoint = $_GET['endpoint'] ?? '';
$id = $_GET['id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

$api = new ChallengeAPI();
$response = $api->handleRequest($method, $endpoint, $id);

echo json_encode($response);

