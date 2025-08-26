-- Modern Green Eco CTF Platform - Database Schema
-- Optimized for MySQL/MariaDB on shared hosting

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: green_eco_ctf

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `country_id` int(11) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `competing` tinyint(1) DEFAULT 1,
  `user_type` enum('user','moderator','admin') DEFAULT 'user',
  `points` int(11) DEFAULT 0,
  `last_active` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `team_name` (`team_name`),
  KEY `country_id` (`country_id`),
  KEY `user_type` (`user_type`),
  KEY `enabled` (`enabled`),
  KEY `competing` (`competing`),
  KEY `points` (`points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `countries`
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(3) NOT NULL,
  `flag_emoji` varchar(10) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `categories`
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#00ff88',
  `enabled` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `enabled` (`enabled`),
  KEY `sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `challenges`
CREATE TABLE `challenges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `flag` varchar(255) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 100,
  `category_id` int(11) NOT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `visible` tinyint(1) DEFAULT 1,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `difficulty` enum('easy','medium','hard','expert') DEFAULT 'medium',
  `tags` text DEFAULT NULL,
  `max_attempts` int(11) DEFAULT NULL,
  `time_limit` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `enabled` (`enabled`),
  KEY `visible` (`visible`),
  KEY `points` (`points`),
  KEY `difficulty` (`difficulty`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `challenges_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `challenges_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `hints`
CREATE TABLE `hints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenge_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `cost` int(11) DEFAULT 0,
  `enabled` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `enabled` (`enabled`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `hints_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `submissions`
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `challenge_id` int(11) NOT NULL,
  `flag` varchar(255) NOT NULL,
  `correct` tinyint(1) NOT NULL DEFAULT 0,
  `points_awarded` int(11) DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `correct` (`correct`),
  KEY `created_at` (`created_at`),
  KEY `ip_address` (`ip_address`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `hint_purchases`
CREATE TABLE `hint_purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `hint_id` int(11) NOT NULL,
  `cost` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_hint` (`user_id`, `hint_id`),
  KEY `hint_id` (`hint_id`),
  CONSTRAINT `hint_purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hint_purchases_ibfk_2` FOREIGN KEY (`hint_id`) REFERENCES `hints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `news`
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `enabled` (`enabled`),
  KEY `featured` (`featured`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `dynamic_pages`
CREATE TABLE `dynamic_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `in_menu` tinyint(1) DEFAULT 0,
  `menu_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `enabled` (`enabled`),
  KEY `in_menu` (`in_menu`),
  KEY `menu_order` (`menu_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `sessions`
CREATE TABLE `sessions` (
  `id` varchar(128) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `last_activity` (`last_activity`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `activity_log`
CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`),
  KEY `ip_address` (`ip_address`),
  CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `rate_limits`
CREATE TABLE `rate_limits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(255) NOT NULL,
  `action` varchar(100) NOT NULL,
  `attempts` int(11) DEFAULT 1,
  `reset_time` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier_action` (`identifier`, `action`),
  KEY `reset_time` (`reset_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `config`
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` enum('string','integer','boolean','json') DEFAULT 'string',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Insert default countries
INSERT INTO `countries` (`name`, `code`, `flag_emoji`) VALUES
('United States', 'US', '🇺🇸'),
('Canada', 'CA', '🇨🇦'),
('United Kingdom', 'GB', '🇬🇧'),
('Germany', 'DE', '🇩🇪'),
('France', 'FR', '🇫🇷'),
('Japan', 'JP', '🇯🇵'),
('Australia', 'AU', '🇦🇺'),
('Brazil', 'BR', '🇧🇷'),
('India', 'IN', '🇮🇳'),
('Sweden', 'SE', '🇸🇪'),
('Netherlands', 'NL', '🇳🇱'),
('Switzerland', 'CH', '🇨🇭'),
('Norway', 'NO', '🇳🇴'),
('Denmark', 'DK', '🇩🇰'),
('Finland', 'FI', '🇫🇮'),
('South Korea', 'KR', '🇰🇷'),
('Singapore', 'SG', '🇸🇬'),
('China', 'CN', '🇨🇳'),
('Russia', 'RU', '🇷🇺'),
('Italy', 'IT', '🇮🇹'),
('Spain', 'ES', '🇪🇸'),
('Mexico', 'MX', '🇲🇽'),
('Argentina', 'AR', '🇦🇷'),
('South Africa', 'ZA', '🇿🇦'),
('Israel', 'IL', '🇮🇱'),
('Turkey', 'TR', '🇹🇷'),
('Poland', 'PL', '🇵🇱'),
('Czech Republic', 'CZ', '🇨🇿'),
('Austria', 'AT', '🇦🇹'),
('Belgium', 'BE', '🇧🇪'),
('Ireland', 'IE', '🇮🇪'),
('New Zealand', 'NZ', '🇳🇿'),
('Ukraine', 'UA', '🇺🇦'),
('Romania', 'RO', '🇷🇴'),
('Hungary', 'HU', '🇭🇺'),
('Portugal', 'PT', '🇵🇹'),
('Greece', 'GR', '🇬🇷'),
('Thailand', 'TH', '🇹🇭'),
('Malaysia', 'MY', '🇲🇾'),
('Indonesia', 'ID', '🇮🇩'),
('Philippines', 'PH', '🇵🇭'),
('Vietnam', 'VN', '🇻🇳'),
('Egypt', 'EG', '🇪🇬'),
('Nigeria', 'NG', '🇳🇬'),
('Kenya', 'KE', '🇰🇪'),
('Morocco', 'MA', '🇲🇦'),
('Chile', 'CL', '🇨🇱'),
('Colombia', 'CO', '🇨🇴'),
('Peru', 'PE', '🇵🇪'),
('Venezuela', 'VE', '🇻🇪'),
('Ecuador', 'EC', '🇪🇨'),
('Uruguay', 'UY', '🇺🇾');

-- Insert default categories
INSERT INTO `categories` (`title`, `description`, `icon`, `color`) VALUES
('Web Security', 'Web application security challenges including SQL injection, XSS, and authentication bypasses', '⚡', '#00ff88'),
('Cryptography', 'Encryption, decryption, and cryptographic protocol challenges', '🌱', '#00cc66'),
('Forensics', 'Digital forensics, steganography, and data recovery challenges', '♻️', '#00aa44'),
('Reverse Engineering', 'Binary analysis, malware reverse engineering, and code analysis', '🌿', '#008833'),
('Static Analysis', 'Source code review, configuration analysis, and vulnerability assessment', '🍃', '#006622');

-- Insert default configuration
INSERT INTO `config` (`key`, `value`, `description`, `type`) VALUES
('site_name', 'Green Eco CTF Platform', 'Name of the CTF platform', 'string'),
('site_description', 'Hack for a Greener Tomorrow', 'Description of the CTF platform', 'string'),
('registration_enabled', '1', 'Allow new user registrations', 'boolean'),
('competition_start', '2025-01-01 00:00:00', 'Competition start time', 'string'),
('competition_end', '2025-12-31 23:59:59', 'Competition end time', 'string'),
('scoreboard_visible', '1', 'Show scoreboard to users', 'boolean'),
('challenges_visible', '1', 'Show challenges to users', 'boolean'),
('max_team_size', '4', 'Maximum number of members per team', 'integer'),
('points_decay_enabled', '0', 'Enable dynamic scoring based on solves', 'boolean'),
('email_verification_required', '0', 'Require email verification for new accounts', 'boolean'),
('two_factor_required', '0', 'Require 2FA for all users', 'boolean'),
('maintenance_mode', '0', 'Enable maintenance mode', 'boolean'),
('maintenance_message', 'The platform is currently under maintenance. Please check back later.', 'Maintenance mode message', 'string');

-- Insert sample challenges for demonstration
INSERT INTO `challenges` (`title`, `description`, `flag`, `points`, `category_id`, `author`, `difficulty`, `tags`) VALUES
('Carbon Credit Portal', 'A fake carbon credit trading portal has been discovered. Find the hidden admin panel and extract sensitive information.', 'flag{green_admin_panel_discovered}', 100, 1, 'EcoSec Team', 'easy', 'web,sql,admin'),
('Solar Panel Telemetry', 'Analyze the solar panel monitoring system and find the flag hidden in the energy readings.', 'flag{solar_energy_data_leaked}', 150, 1, 'EcoSec Team', 'medium', 'web,api,energy'),
('Encrypted Waste Data', 'The waste management system uses a custom encryption algorithm. Decrypt the data to find the flag.', 'flag{waste_not_want_not}', 200, 2, 'EcoSec Team', 'medium', 'crypto,custom,environment'),
('Forest Satellite Images', 'Satellite images show illegal logging activity. Use forensic techniques to uncover the hidden message.', 'flag{save_the_forests}', 175, 3, 'EcoSec Team', 'medium', 'forensics,steganography,satellite'),
('Smart Thermostat Firmware', 'Reverse engineer the smart thermostat firmware to find the backdoor access code.', 'flag{smart_home_compromised}', 250, 4, 'EcoSec Team', 'hard', 'reverse,firmware,iot'),
('Green Energy Config', 'Review the configuration files of a green energy management system for security vulnerabilities.', 'flag{config_review_complete}', 125, 5, 'EcoSec Team', 'easy', 'static,config,review');

-- Create indexes for better performance
CREATE INDEX idx_users_points_desc ON users (points DESC);
CREATE INDEX idx_submissions_user_challenge ON submissions (user_id, challenge_id);
CREATE INDEX idx_submissions_correct_created ON submissions (correct, created_at);
CREATE INDEX idx_activity_log_created ON activity_log (created_at);
CREATE INDEX idx_challenges_category_points ON challenges (category_id, points);

COMMIT;

