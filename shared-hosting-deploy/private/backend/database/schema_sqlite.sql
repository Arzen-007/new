-- Modern Green Eco CTF Platform - Database Schema (SQLite Compatible)

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` TEXT NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `team_name` TEXT NOT NULL UNIQUE,
  `country_id` INTEGER DEFAULT NULL,
  `enabled` INTEGER DEFAULT 1,
  `competing` INTEGER DEFAULT 1,
  `user_type` TEXT DEFAULT 'user',
  `points` INTEGER DEFAULT 0,
  `last_active` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `email_verified` INTEGER DEFAULT 0,
  `email_verification_token` TEXT DEFAULT NULL,
  `password_reset_token` TEXT DEFAULT NULL,
  `password_reset_expires` DATETIME DEFAULT NULL,
  `two_factor_secret` TEXT DEFAULT NULL,
  `two_factor_enabled` INTEGER DEFAULT 0,
  `login_attempts` INTEGER DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL
);

-- Table structure for table `countries`
CREATE TABLE `countries` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `code` TEXT NOT NULL UNIQUE,
  `flag_emoji` TEXT DEFAULT NULL,
  `enabled` INTEGER DEFAULT 1
);

-- Table structure for table `categories`
CREATE TABLE `categories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `icon` TEXT DEFAULT NULL,
  `color` TEXT DEFAULT '#00ff88',
  `enabled` INTEGER DEFAULT 1,
  `sort_order` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `challenges`
CREATE TABLE `challenges` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `flag` TEXT NOT NULL,
  `points` INTEGER NOT NULL DEFAULT 100,
  `category_id` INTEGER NOT NULL,
  `enabled` INTEGER DEFAULT 1,
  `visible` INTEGER DEFAULT 1,
  `file_name` TEXT DEFAULT NULL,
  `file_path` TEXT DEFAULT NULL,
  `file_size` INTEGER DEFAULT NULL,
  `file_hash` TEXT DEFAULT NULL,
  `author` TEXT DEFAULT NULL,
  `difficulty` TEXT DEFAULT 'medium',
  `tags` TEXT DEFAULT NULL,
  `max_attempts` INTEGER DEFAULT NULL,
  `time_limit` INTEGER DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Table structure for table `hints`
CREATE TABLE `hints` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `challenge_id` INTEGER NOT NULL,
  `title` TEXT NOT NULL,
  `body` TEXT NOT NULL,
  `cost` INTEGER DEFAULT 0,
  `enabled` INTEGER DEFAULT 1,
  `sort_order` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
);

-- Table structure for table `submissions`
CREATE TABLE `submissions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `challenge_id` INTEGER NOT NULL,
  `flag` TEXT NOT NULL,
  `correct` INTEGER NOT NULL DEFAULT 0,
  `points_awarded` INTEGER DEFAULT 0,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
);

-- Table structure for table `hint_purchases`
CREATE TABLE `hint_purchases` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `hint_id` INTEGER NOT NULL,
  `cost` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `hint_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`hint_id`) REFERENCES `hints` (`id`) ON DELETE CASCADE
);

-- Table structure for table `news`
CREATE TABLE `news` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `body` TEXT NOT NULL,
  `author_id` INTEGER DEFAULT NULL,
  `enabled` INTEGER DEFAULT 1,
  `featured` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Table structure for table `dynamic_pages`
CREATE TABLE `dynamic_pages` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `slug` TEXT NOT NULL UNIQUE,
  `body` TEXT NOT NULL,
  `enabled` INTEGER DEFAULT 1,
  `in_menu` INTEGER DEFAULT 0,
  `menu_order` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `sessions`
CREATE TABLE `sessions` (
  `id` TEXT PRIMARY KEY,
  `user_id` INTEGER DEFAULT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `payload` TEXT NOT NULL,
  `last_activity` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Table structure for table `activity_log`
CREATE TABLE `activity_log` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER DEFAULT NULL,
  `action` TEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `metadata` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Table structure for table `rate_limits`
CREATE TABLE `rate_limits` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `identifier` TEXT NOT NULL,
  `action` TEXT NOT NULL,
  `attempts` INTEGER DEFAULT 1,
  `reset_time` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`identifier`, `action`)
);

-- Table structure for table `config`
CREATE TABLE `config` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `key` TEXT NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `type` TEXT DEFAULT 'string',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default countries
INSERT INTO `countries` (`name`, `code`, `flag_emoji`) VALUES
("United States", "US", "🇺🇸"),
("Canada", "CA", "🇨🇦"),
("United Kingdom", "GB", "🇬🇧"),
("Germany", "DE", "🇩🇪"),
("France", "FR", "🇫🇷"),
("Japan", "JP", "🇯🇵"),
("Australia", "AU", "🇦🇺"),
("Brazil", "BR", "🇧🇷"),
("India", "IN", "🇮🇳"),
("Sweden", "SE", "🇸🇪"),
("Netherlands", "NL", "🇳🇱"),
("Switzerland", "CH", "🇨🇭"),
("Norway", "NO", "🇳🇴"),
("Denmark", "DK", "🇩🇰"),
("Finland", "FI", "🇫🇮"),
("South Korea", "KR", "🇰🇷"),
("Singapore", "SG", "🇸🇬"),
("China", "CN", "🇨🇳"),
("Russia", "RU", "🇷🇺"),
("Italy", "IT", "🇮🇹"),
("Spain", "ES", "🇪🇸"),
("Mexico", "MX", "🇲🇽"),
("Argentina", "AR", "🇦🇷"),
("South Africa", "ZA", "🇿🇦"),
("Israel", "IL", "🇮🇱"),
("Turkey", "TR", "🇹🇷"),
("Poland", "PL", "🇵🇱"),
("Czech Republic", "CZ", "🇨🇿"),
("Austria", "AT", "🇦🇹"),
("Belgium", "BE", "🇧🇪"),
("Ireland", "IE", "🇮🇪"),
("New Zealand", "NZ", "🇳🇿"),
("Ukraine", "UA", "🇺🇦"),
("Romania", "RO", "🇷🇴"),
("Hungary", "HU", "🇭🇺"),
("Portugal", "PT", "🇵🇹"),
("Greece", "GR", "🇬🇷"),
("Thailand", "TH", "🇹🇭"),
("Malaysia", "MY", "🇲🇾"),
("Indonesia", "ID", "🇮🇩"),
("Philippines", "PH", "🇵🇭"),
("Vietnam", "VN", "🇻🇳"),
("Egypt", "EG", "🇪🇬"),
("Nigeria", "NG", "🇳🇬"),
("Kenya", "KE", "🇰🇪"),
("Morocco", "MA", "🇲🇦"),
("Chile", "CL", "🇨🇱"),
("Colombia", "CO", "🇨🇴"),
("Peru", "PE", "🇵🇪"),
("Venezuela", "VE", "🇻🇪"),
("Ecuador", "EC", "🇪🇨"),
("Uruguay", "UY", "🇺🇾");

-- Insert default categories
INSERT INTO `categories` (`title`, `description`, `icon`, `color`) VALUES
("Web Security", "Web application security challenges including SQL injection, XSS, and authentication bypasses", "⚡", "#00ff88"),
("Cryptography", "Encryption, decryption, and cryptographic protocol challenges", "🌱", "#00cc66"),
("Forensics", "Digital forensics, steganography, and data recovery challenges", "♻️", "#00aa44"),
("Reverse Engineering", "Binary analysis, malware reverse engineering, and code analysis", "🌿", "#008833"),
("Static Analysis", "Source code review, configuration analysis, and vulnerability assessment", "🍃", "#006622");

-- Insert default configuration
INSERT INTO `config` (`key`, `value`, `description`, `type`) VALUES
("site_name", "Green Eco CTF Platform", "Name of the CTF platform", "string"),
("site_description", "Hack for a Greener Tomorrow", "Description of the CTF platform", "string"),
("registration_enabled", "1", "Allow new user registrations", "boolean"),
("competition_start", "2025-01-01 00:00:00", "Competition start time", "string"),
("competition_end", "2025-12-31 23:59:59", "Competition end time", "string"),
("scoreboard_visible", "1", "Show scoreboard to users", "boolean"),
("challenges_visible", "1", "Show challenges to users", "boolean"),
("max_team_size", "4", "Maximum number of members per team", "integer"),
("points_decay_enabled", "0", "Enable dynamic scoring based on solves", "boolean"),
("email_verification_required", "0", "Require email verification for new accounts", "boolean"),
("two_factor_required", "0", "Require 2FA for all users", "boolean"),
("maintenance_mode", "0", "Enable maintenance mode", "boolean"),
("maintenance_message", "The platform is currently under maintenance. Please check back later.", "Maintenance mode message", "string");

-- Insert sample challenges for demonstration
INSERT INTO `challenges` (`title`, `description`, `flag`, `points`, `category_id`, `author`, `difficulty`, `tags`) VALUES
("Carbon Credit Portal", "A fake carbon credit trading portal has been discovered. Find the hidden admin panel and extract sensitive information.", "flag{green_admin_panel_discovered}", 100, 1, "EcoSec Team", "easy", "web,sql,admin"),
("Solar Panel Telemetry", "Analyze the solar panel monitoring system and find the flag hidden in the energy readings.", "flag{solar_energy_data_leaked}", 150, 1, "EcoSec Team", "medium", "web,api,energy"),
("Encrypted Waste Data", "The waste management system uses a custom encryption algorithm. Decrypt the data to find the flag.", "flag{waste_not_want_not}", 200, 2, "EcoSec Team", "medium", "crypto,custom,environment"),
("Forest Satellite Images", "Satellite images show illegal logging activity. Use forensic techniques to uncover the hidden message.", "flag{save_the_forests}", 175, 3, "EcoSec Team", "medium", "forensics,steganography,satellite"),
("Smart Thermostat Firmware", "Reverse engineer the smart thermostat firmware to find the backdoor access code.", "flag{smart_home_compromised}", 250, 4, "EcoSec Team", "hard", "reverse,firmware,iot"),
("Green Energy Config", "Review the configuration files of a green energy management system for security vulnerabilities.", "flag{config_review_complete}", 125, 5, "EcoSec Team", "easy", "static,config,review");

-- Create indexes for better performance
CREATE INDEX idx_users_points_desc ON users (points DESC);
CREATE INDEX idx_submissions_user_challenge ON submissions (user_id, challenge_id);
CREATE INDEX idx_submissions_correct_created ON submissions (correct, created_at);
CREATE INDEX idx_activity_log_created ON activity_log (created_at);
CREATE INDEX idx_challenges_category_points ON challenges (category_id, points);

