<?php
/**
 * Modern Green Eco CTF Platform
 * Authentication API Routes
 * 
 * This file handles all authentication-related API endpoints
 * including login, registration, password reset, and 2FA.
 */

require_once '../../includes/AuthManager.php';
require_once '../../includes/Validator.php';
require_once '../../includes/Logger.php';

class AuthAPI {
    private $auth;
    private $logger;

    public function __construct() {
        $this->auth = new AuthManager();
        $this->logger = logger();
    }

    /**
     * Handle authentication requests
     */
    public function handleRequest($method, $endpoint) {
        try {
            switch ($endpoint) {
                case 'login':
                    return $this->login();
                case 'register':
                    return $this->register();
                case 'logout':
                    return $this->logout();
                case 'refresh':
                    return $this->refreshToken();
                case 'forgot-password':
                    return $this->forgotPassword();
                case 'reset-password':
                    return $this->resetPassword();
                case 'setup-2fa':
                    return $this->setup2FA();
                case 'verify-2fa':
                    return $this->verify2FA();
                case 'me':
                    return $this->getCurrentUser();
                default:
                    throw new Exception('Endpoint not found');
            }
        } catch (Exception $e) {
            $this->logger->error(Logger::CATEGORY_AUTH, 'API error: ' . $e->getMessage(), [
                'endpoint' => $endpoint,
                'method' => $method
            ]);
            
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * User login
     */
    private function login() {
        $input = $this->getJsonInput();
        
        if (empty($input['email']) || empty($input['password'])) {
            throw new Exception('Email and password are required');
        }

        $result = $this->auth->login(
            $input['email'],
            $input['password'],
            $input['remember_me'] ?? false
        );

        $this->logger->logAuth('user_login_success', $result['user']['id'], [
            'email' => $input['email']
        ]);

        return $this->successResponse('Login successful', $result);
    }

    /**
     * User registration
     */
    private function register() {
        $input = $this->getJsonInput();
        
        $required = ['email', 'password', 'team_name'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                throw new Exception("Field '{$field}' is required");
            }
        }

        $result = $this->auth->register(
            $input['email'],
            $input['password'],
            $input['team_name'],
            $input['country_code'] ?? null
        );

        $this->logger->logAuth('user_registration_success', $result['user_id'], [
            'email' => $input['email'],
            'team_name' => $input['team_name']
        ]);

        return $this->successResponse('Registration successful', [
            'user_id' => $result['user_id'],
            'message' => 'Account created successfully'
        ]);
    }

    /**
     * User logout
     */
    private function logout() {
        $user = $this->requireAuth();
        
        // In a more sophisticated implementation, you might invalidate the token
        // For now, we just log the logout event
        $this->logger->logAuth('user_logout', $user['id']);
        
        return $this->successResponse('Logout successful');
    }

    /**
     * Refresh JWT token
     */
    private function refreshToken() {
        $user = $this->requireAuth();
        
        // Generate new token
        $tokenExpiry = time() + 3600; // 1 hour
        $token = $this->auth->generateJwtToken($user['id'], $tokenExpiry);
        
        return $this->successResponse('Token refreshed', [
            'token' => $token,
            'expires_at' => $tokenExpiry
        ]);
    }

    /**
     * Request password reset
     */
    private function forgotPassword() {
        $input = $this->getJsonInput();
        
        if (empty($input['email'])) {
            throw new Exception('Email is required');
        }

        $resetToken = $this->auth->requestPasswordReset($input['email']);
        
        $this->logger->logAuth('password_reset_requested', null, [
            'email' => $input['email']
        ]);

        // In production, send email with reset link
        // For now, return success message
        return $this->successResponse('Password reset email sent');
    }

    /**
     * Reset password with token
     */
    private function resetPassword() {
        $input = $this->getJsonInput();
        
        if (empty($input['token']) || empty($input['password'])) {
            throw new Exception('Token and new password are required');
        }

        $this->auth->resetPassword($input['token'], $input['password']);
        
        $this->logger->logAuth('password_reset_completed');
        
        return $this->successResponse('Password reset successful');
    }

    /**
     * Setup two-factor authentication
     */
    private function setup2FA() {
        $user = $this->requireAuth();
        
        $secret = $this->auth->setup2FA($user['id']);
        
        $this->logger->logAuth('2fa_setup_initiated', $user['id']);
        
        return $this->successResponse('2FA setup initiated', [
            'secret' => $secret,
            'qr_code_url' => $this->generate2FAQRCode($secret, $user['email'])
        ]);
    }

    /**
     * Verify two-factor authentication
     */
    private function verify2FA() {
        $user = $this->requireAuth();
        $input = $this->getJsonInput();
        
        if (empty($input['code'])) {
            throw new Exception('2FA code is required');
        }

        $this->auth->verify2FA($user['id'], $input['code']);
        
        $this->logger->logAuth('2fa_verification_success', $user['id']);
        
        return $this->successResponse('2FA verification successful');
    }

    /**
     * Get current user information
     */
    private function getCurrentUser() {
        $user = $this->requireAuth();
        
        // Get additional user information
        $userInfo = db_fetch_one(
            "SELECT id, email, team_name, role, country_code, created_at, last_active,
                    (SELECT COUNT(*) FROM submissions WHERE user_id = users.id AND correct = 1) as solved_challenges,
                    (SELECT SUM(points) FROM submissions s JOIN challenges c ON c.id = s.challenge_id 
                     WHERE s.user_id = users.id AND s.correct = 1) as total_points
             FROM users WHERE id = :id",
            ['id' => $user['id']]
        );

        return $this->successResponse('User information retrieved', [
            'user' => $userInfo
        ]);
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
     * Generate 2FA QR code URL
     */
    private function generate2FAQRCode($secret, $email) {
        $issuer = $_ENV['APP_NAME'] ?? 'CTF Platform';
        $label = urlencode($issuer . ':' . $email);
        $qrData = "otpauth://totp/{$label}?secret={$secret}&issuer=" . urlencode($issuer);
        
        return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($qrData);
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

// Get endpoint from URL
$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$api = new AuthAPI();
$response = $api->handleRequest($method, $endpoint);

echo json_encode($response);

