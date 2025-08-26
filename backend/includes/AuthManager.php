<?php
/**
 * Modern Green Eco CTF Platform
 * Authentication and Authorization Manager
 * 
 * This class provides comprehensive authentication and authorization
 * with JWT tokens, 2FA, rate limiting, and role-based access control.
 */

require_once 'Validator.php';

class AuthManager {
    private $db;
    private $jwtSecret;
    private $jwtExpiry;
    private $maxLoginAttempts;
    private $lockoutDuration;

    // User roles
    const ROLE_USER = 1;
    const ROLE_MODERATOR = 2;
    const ROLE_ADMIN = 3;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-this';
        $this->jwtExpiry = 3600 * 24; // 24 hours
        $this->maxLoginAttempts = 5;
        $this->lockoutDuration = 900; // 15 minutes
    }

    /**
     * Register a new user
     */
    public function register($email, $password, $teamName, $countryCode = null) {
        // Validate inputs
        $email = Validator::validateEmail($email);
        $password = Validator::validatePassword($password);
        $teamName = Validator::validateTeamName($teamName);
        
        if ($countryCode) {
            $countryCode = Validator::validateCountryCode($countryCode);
        }

        // Check if email already exists
        $existingUser = $this->db->fetchOne(
            "SELECT id FROM users WHERE email = :email",
            ['email' => $email]
        );

        if ($existingUser) {
            throw new Exception('Email already registered');
        }

        // Check if team name already exists
        $existingTeam = $this->db->fetchOne(
            "SELECT id FROM users WHERE team_name = :team_name",
            ['team_name' => $teamName]
        );

        if ($existingTeam) {
            throw new Exception('Team name already taken');
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);

        // Generate verification token
        $verificationToken = bin2hex(random_bytes(32));

        // Insert user
        $userId = $this->db->insert('users', [
            'email' => $email,
            'password_hash' => $passwordHash,
            'team_name' => $teamName,
            'country_code' => $countryCode,
            'role' => self::ROLE_USER,
            'enabled' => 1,
            'competing' => 1,
            'verification_token' => $verificationToken,
            'created_at' => time(),
            'last_active' => time()
        ]);

        // Log registration
        $this->logSecurityEvent('user_registered', $userId, [
            'email' => $email,
            'team_name' => $teamName,
            'ip' => $this->getClientIp()
        ]);

        return [
            'user_id' => $userId,
            'verification_token' => $verificationToken
        ];
    }

    /**
     * Authenticate user login
     */
    public function login($email, $password, $rememberMe = false) {
        $email = Validator::validateEmail($email);
        $ip = $this->getClientIp();

        // Check rate limiting
        $this->checkRateLimit($email, $ip);

        // Get user
        $user = $this->db->fetchOne(
            "SELECT id, email, password_hash, team_name, role, enabled, two_factor_secret, locked_until 
             FROM users WHERE email = :email",
            ['email' => $email]
        );

        if (!$user) {
            $this->recordFailedLogin($email, $ip, 'user_not_found');
            throw new Exception('Invalid credentials');
        }

        // Check if account is locked
        if ($user['locked_until'] && $user['locked_until'] > time()) {
            $this->recordFailedLogin($email, $ip, 'account_locked');
            throw new Exception('Account temporarily locked');
        }

        // Check if account is enabled
        if (!$user['enabled']) {
            $this->recordFailedLogin($email, $ip, 'account_disabled');
            throw new Exception('Account disabled');
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            $this->recordFailedLogin($email, $ip, 'invalid_password');
            throw new Exception('Invalid credentials');
        }

        // Check if password needs rehashing
        if (password_needs_rehash($user['password_hash'], PASSWORD_ARGON2ID)) {
            $newHash = password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost' => 4,
                'threads' => 3
            ]);
            
            $this->db->update('users', 
                ['password_hash' => $newHash], 
                ['id' => $user['id']]
            );
        }

        // Clear failed login attempts
        $this->clearFailedLogins($email, $ip);

        // Update last active
        $this->db->update('users', 
            ['last_active' => time()], 
            ['id' => $user['id']]
        );

        // Generate JWT token
        $tokenExpiry = $rememberMe ? (time() + (30 * 24 * 3600)) : (time() + $this->jwtExpiry);
        $token = $this->generateJwtToken($user['id'], $tokenExpiry);

        // Log successful login
        $this->logSecurityEvent('user_login', $user['id'], [
            'ip' => $ip,
            'remember_me' => $rememberMe
        ]);

        return [
            'token' => $token,
            'expires_at' => $tokenExpiry,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'team_name' => $user['team_name'],
                'role' => $user['role'],
                'requires_2fa' => !empty($user['two_factor_secret'])
            ]
        ];
    }

    /**
     * Verify JWT token and get user
     */
    public function verifyToken($token) {
        if (!$token) {
            throw new Exception('No token provided');
        }

        try {
            $payload = $this->decodeJwtToken($token);
            
            if ($payload['exp'] < time()) {
                throw new Exception('Token expired');
            }

            $user = $this->db->fetchOne(
                "SELECT id, email, team_name, role, enabled FROM users WHERE id = :id",
                ['id' => $payload['user_id']]
            );

            if (!$user || !$user['enabled']) {
                throw new Exception('Invalid user');
            }

            return $user;
        } catch (Exception $e) {
            throw new Exception('Invalid token');
        }
    }

    /**
     * Setup two-factor authentication
     */
    public function setup2FA($userId) {
        $secret = $this->generate2FASecret();
        
        $this->db->update('users', 
            ['two_factor_secret' => $secret], 
            ['id' => $userId]
        );

        $this->logSecurityEvent('2fa_setup', $userId);

        return $secret;
    }

    /**
     * Verify two-factor authentication code
     */
    public function verify2FA($userId, $code) {
        $user = $this->db->fetchOne(
            "SELECT two_factor_secret FROM users WHERE id = :id",
            ['id' => $userId]
        );

        if (!$user || !$user['two_factor_secret']) {
            throw new Exception('2FA not setup');
        }

        if (!$this->verify2FACode($user['two_factor_secret'], $code)) {
            $this->logSecurityEvent('2fa_failed', $userId, ['ip' => $this->getClientIp()]);
            throw new Exception('Invalid 2FA code');
        }

        $this->logSecurityEvent('2fa_verified', $userId);
        return true;
    }

    /**
     * Request password reset
     */
    public function requestPasswordReset($email) {
        $email = Validator::validateEmail($email);
        
        $user = $this->db->fetchOne(
            "SELECT id FROM users WHERE email = :email AND enabled = 1",
            ['email' => $email]
        );

        if (!$user) {
            // Don't reveal if email exists
            return true;
        }

        $resetToken = bin2hex(random_bytes(32));
        $resetExpiry = time() + 3600; // 1 hour

        $this->db->update('users', [
            'reset_token' => $resetToken,
            'reset_token_expires' => $resetExpiry
        ], ['id' => $user['id']]);

        $this->logSecurityEvent('password_reset_requested', $user['id'], [
            'ip' => $this->getClientIp()
        ]);

        return $resetToken;
    }

    /**
     * Reset password with token
     */
    public function resetPassword($token, $newPassword) {
        $newPassword = Validator::validatePassword($newPassword);
        
        $user = $this->db->fetchOne(
            "SELECT id FROM users WHERE reset_token = :token AND reset_token_expires > :now",
            ['token' => $token, 'now' => time()]
        );

        if (!$user) {
            throw new Exception('Invalid or expired reset token');
        }

        $passwordHash = password_hash($newPassword, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);

        $this->db->update('users', [
            'password_hash' => $passwordHash,
            'reset_token' => null,
            'reset_token_expires' => null
        ], ['id' => $user['id']]);

        $this->logSecurityEvent('password_reset_completed', $user['id']);
        return true;
    }

    /**
     * Check if user has permission
     */
    public function hasPermission($userId, $requiredRole) {
        $user = $this->db->fetchOne(
            "SELECT role FROM users WHERE id = :id AND enabled = 1",
            ['id' => $userId]
        );

        return $user && $user['role'] >= $requiredRole;
    }

    /**
     * Check rate limiting for login attempts
     */
    private function checkRateLimit($email, $ip) {
        $cutoff = time() - $this->lockoutDuration;
        
        $attempts = $this->db->count('login_attempts', [
            'email' => $email,
            'created_at' => $cutoff
        ]);

        if ($attempts >= $this->maxLoginAttempts) {
            throw new Exception('Too many login attempts. Please try again later.');
        }
    }

    /**
     * Record failed login attempt
     */
    private function recordFailedLogin($email, $ip, $reason) {
        $this->db->insert('login_attempts', [
            'email' => $email,
            'ip_address' => $ip,
            'reason' => $reason,
            'created_at' => time()
        ]);

        // Lock account after max attempts
        $attempts = $this->db->count('login_attempts', [
            'email' => $email,
            'created_at' => time() - $this->lockoutDuration
        ]);

        if ($attempts >= $this->maxLoginAttempts) {
            $this->db->query(
                "UPDATE users SET locked_until = :locked_until WHERE email = :email",
                [
                    'locked_until' => time() + $this->lockoutDuration,
                    'email' => $email
                ]
            );
        }
    }

    /**
     * Clear failed login attempts
     */
    private function clearFailedLogins($email, $ip) {
        $this->db->delete('login_attempts', ['email' => $email]);
    }

    /**
     * Generate JWT token
     */
    private function generateJwtToken($userId, $expiry) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'iat' => time(),
            'exp' => $expiry
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->jwtSecret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Decode JWT token
     */
    private function decodeJwtToken($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }

        $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0])), true);
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));

        $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $this->jwtSecret, true);

        if (!hash_equals($expectedSignature, $signature)) {
            throw new Exception('Invalid token signature');
        }

        return $payload;
    }

    /**
     * Generate 2FA secret
     */
    private function generate2FASecret() {
        return base32_encode(random_bytes(20));
    }

    /**
     * Verify 2FA code
     */
    private function verify2FACode($secret, $code) {
        // Simple TOTP implementation
        $timeSlice = floor(time() / 30);
        
        for ($i = -1; $i <= 1; $i++) {
            $calculatedCode = $this->calculateTOTP($secret, $timeSlice + $i);
            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Calculate TOTP code
     */
    private function calculateTOTP($secret, $timeSlice) {
        $key = base32_decode($secret);
        $time = pack('N*', 0) . pack('N*', $timeSlice);
        $hash = hash_hmac('sha1', $time, $key, true);
        $offset = ord($hash[19]) & 0xf;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        ) % 1000000;
        
        return str_pad($code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Log security event
     */
    private function logSecurityEvent($event, $userId = null, $data = []) {
        $this->db->insert('security_logs', [
            'event' => $event,
            'user_id' => $userId,
            'ip_address' => $this->getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'data' => json_encode($data),
            'created_at' => time()
        ]);
    }
}

// Helper functions for base32 encoding/decoding
function base32_encode($data) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $output = '';
    $v = 0;
    $vbits = 0;
    
    for ($i = 0; $i < strlen($data); $i++) {
        $v = ($v << 8) | ord($data[$i]);
        $vbits += 8;
        
        while ($vbits >= 5) {
            $output .= $alphabet[($v >> ($vbits - 5)) & 31];
            $vbits -= 5;
        }
    }
    
    if ($vbits > 0) {
        $output .= $alphabet[($v << (5 - $vbits)) & 31];
    }
    
    return $output;
}

function base32_decode($data) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $output = '';
    $v = 0;
    $vbits = 0;
    
    for ($i = 0; $i < strlen($data); $i++) {
        $v = ($v << 5) | strpos($alphabet, $data[$i]);
        $vbits += 5;
        
        if ($vbits >= 8) {
            $output .= chr(($v >> ($vbits - 8)) & 255);
            $vbits -= 8;
        }
    }
    
    return $output;
}

