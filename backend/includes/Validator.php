<?php
/**
 * Modern Green Eco CTF Platform
 * Input Validation and Sanitization
 * 
 * This class provides comprehensive input validation and sanitization
 * to prevent XSS, SQL injection, and other security vulnerabilities.
 */

class Validator {
    
    /**
     * Sanitize string input
     */
    public static function sanitizeString($input, $maxLength = null) {
        if (!is_string($input)) {
            return '';
        }
        
        // Remove null bytes and control characters
        $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
        
        // Trim whitespace
        $input = trim($input);
        
        // Limit length if specified
        if ($maxLength && strlen($input) > $maxLength) {
            $input = substr($input, 0, $maxLength);
        }
        
        return $input;
    }

    /**
     * Sanitize HTML output to prevent XSS
     */
    public static function sanitizeHtml($input) {
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Validate and sanitize email
     */
    public static function validateEmail($email) {
        $email = self::sanitizeString($email, 255);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email format');
        }
        
        // Additional checks for common email attacks
        if (preg_match('/[<>"\']/', $email)) {
            throw new InvalidArgumentException('Invalid characters in email');
        }
        
        return strtolower($email);
    }

    /**
     * Validate integer ID
     */
    public static function validateId($id) {
        if (!is_numeric($id) || $id <= 0 || $id != (int)$id) {
            throw new InvalidArgumentException('Invalid ID format');
        }
        
        return (int)$id;
    }

    /**
     * Validate string length
     */
    public static function validateLength($input, $minLength = 1, $maxLength = 255) {
        $input = self::sanitizeString($input);
        $length = strlen($input);
        
        if ($length < $minLength) {
            throw new InvalidArgumentException("Input too short (minimum {$minLength} characters)");
        }
        
        if ($length > $maxLength) {
            throw new InvalidArgumentException("Input too long (maximum {$maxLength} characters)");
        }
        
        return $input;
    }

    /**
     * Validate team name
     */
    public static function validateTeamName($teamName) {
        $teamName = self::validateLength($teamName, 2, 50);
        
        // Allow alphanumeric, spaces, hyphens, underscores
        if (!preg_match('/^[a-zA-Z0-9\s\-_]+$/', $teamName)) {
            throw new InvalidArgumentException('Team name contains invalid characters');
        }
        
        return $teamName;
    }

    /**
     * Validate challenge title
     */
    public static function validateChallengeTitle($title) {
        return self::validateLength($title, 3, 100);
    }

    /**
     * Validate challenge description
     */
    public static function validateChallengeDescription($description) {
        return self::validateLength($description, 10, 5000);
    }

    /**
     * Validate flag
     */
    public static function validateFlag($flag) {
        $flag = self::sanitizeString($flag, 255);
        
        if (strlen($flag) < 1) {
            throw new InvalidArgumentException('Flag cannot be empty');
        }
        
        return $flag;
    }

    /**
     * Validate points
     */
    public static function validatePoints($points) {
        if (!is_numeric($points) || $points < 0 || $points > 10000) {
            throw new InvalidArgumentException('Invalid points value (0-10000)');
        }
        
        return (int)$points;
    }

    /**
     * Validate boolean
     */
    public static function validateBoolean($value) {
        if (is_bool($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            $value = strtolower($value);
            if (in_array($value, ['true', '1', 'yes', 'on'])) {
                return true;
            }
            if (in_array($value, ['false', '0', 'no', 'off', ''])) {
                return false;
            }
        }
        
        if (is_numeric($value)) {
            return (bool)(int)$value;
        }
        
        throw new InvalidArgumentException('Invalid boolean value');
    }

    /**
     * Validate country code
     */
    public static function validateCountryCode($code) {
        $code = self::sanitizeString($code, 2);
        
        if (!preg_match('/^[A-Z]{2}$/', strtoupper($code))) {
            throw new InvalidArgumentException('Invalid country code format');
        }
        
        return strtoupper($code);
    }

    /**
     * Validate password strength
     */
    public static function validatePassword($password) {
        if (strlen($password) < 8) {
            throw new InvalidArgumentException('Password must be at least 8 characters long');
        }
        
        if (strlen($password) > 128) {
            throw new InvalidArgumentException('Password too long (maximum 128 characters)');
        }
        
        // Check for at least one uppercase, lowercase, number, and special character
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/', $password)) {
            throw new InvalidArgumentException('Password must contain at least one uppercase letter, lowercase letter, number, and special character');
        }
        
        return $password;
    }

    /**
     * Validate file upload
     */
    public static function validateFileUpload($file, $allowedTypes = [], $maxSize = 10485760) { // 10MB default
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new InvalidArgumentException('Invalid file upload');
        }
        
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new InvalidArgumentException('No file was uploaded');
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new InvalidArgumentException('File too large');
            default:
                throw new InvalidArgumentException('File upload error');
        }
        
        if ($file['size'] > $maxSize) {
            throw new InvalidArgumentException('File too large (maximum ' . ($maxSize / 1024 / 1024) . 'MB)');
        }
        
        if (!empty($allowedTypes)) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);
            
            if (!in_array($mimeType, $allowedTypes)) {
                throw new InvalidArgumentException('File type not allowed');
            }
        }
        
        return true;
    }

    /**
     * Validate URL
     */
    public static function validateUrl($url) {
        $url = self::sanitizeString($url, 2048);
        
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException('Invalid URL format');
        }
        
        // Only allow HTTP and HTTPS
        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array($scheme, ['http', 'https'])) {
            throw new InvalidArgumentException('Only HTTP and HTTPS URLs are allowed');
        }
        
        return $url;
    }

    /**
     * Validate JSON
     */
    public static function validateJson($json) {
        if (!is_string($json)) {
            throw new InvalidArgumentException('JSON must be a string');
        }
        
        $decoded = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException('Invalid JSON format: ' . json_last_error_msg());
        }
        
        return $decoded;
    }

    /**
     * Validate datetime
     */
    public static function validateDateTime($datetime) {
        if (empty($datetime)) {
            return null;
        }
        
        $timestamp = strtotime($datetime);
        
        if ($timestamp === false) {
            throw new InvalidArgumentException('Invalid datetime format');
        }
        
        return $timestamp;
    }

    /**
     * Validate IP address
     */
    public static function validateIpAddress($ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            throw new InvalidArgumentException('Invalid IP address');
        }
        
        return $ip;
    }

    /**
     * Sanitize filename
     */
    public static function sanitizeFilename($filename) {
        // Remove path separators and null bytes
        $filename = str_replace(['/', '\\', "\0"], '', $filename);
        
        // Remove or replace dangerous characters
        $filename = preg_replace('/[<>:"|?*]/', '_', $filename);
        
        // Remove leading/trailing dots and spaces
        $filename = trim($filename, '. ');
        
        // Ensure filename is not empty
        if (empty($filename)) {
            $filename = 'file_' . uniqid();
        }
        
        return $filename;
    }

    /**
     * Validate CSRF token
     */
    public static function validateCsrfToken($token, $sessionToken) {
        if (!hash_equals($sessionToken, $token)) {
            throw new InvalidArgumentException('Invalid CSRF token');
        }
        
        return true;
    }
}

