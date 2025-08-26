# Modern Green Eco CTF Platform - Comprehensive Deployment Guide

## 1. Introduction

This guide provides detailed instructions for deploying the Modern Green Eco CTF Platform on a shared hosting environment. The platform is built with a secure PHP backend and a modern React.js frontend, optimized for performance and security on shared hosting.

### 1.1. Platform Overview

- **Backend**: Secure PHP 8.x with a RESTful API
- **Frontend**: React.js with Vite, Tailwind CSS, and Framer Motion
- **Database**: MySQL / MariaDB
- **Theme**: Green eco-friendly theme with advanced visual effects
- **Features**: Complete CTF functionality, including user management, challenge management, scoreboard, admin panel, and more.

### 1.2. System Requirements

- **Web Server**: Apache with `mod_rewrite` enabled
- **PHP**: Version 8.0 or higher with the following extensions: `pdo_mysql`, `json`, `openssl`, `mbstring`, `gd`
- **Database**: MySQL 5.7+ or MariaDB 10.2+
- **Node.js**: Version 18.x or higher (for building the frontend, not required on the server)

## 2. Pre-Deployment Preparation

### 2.1. Domain and Hosting

- Ensure you have a domain name and a shared hosting plan that meets the system requirements.
- Access to your hosting control panel (e.g., cPanel, hPanel) is required.

### 2.2. Database Setup

1.  Log in to your hosting control panel.
2.  Navigate to the **MySQL Databases** section.
3.  Create a new database (e.g., `your_ctf_db`).
4.  Create a new database user with a strong password.
5.  Add the user to the database and grant all privileges.

### 2.3. Security Preparation

- Generate strong, unique keys for `APP_KEY`, `JWT_SECRET`, and `ENCRYPTION_KEY` in your `.env` file. You can use an online key generator for this.

## 3. Deployment Steps

### 3.1. Upload Files

1.  Extract the `shared-hosting-deploy.tar.gz` archive on your local machine.
2.  Using an FTP client (e.g., FileZilla) or your hosting provider's file manager, upload the contents of the `public_html` folder to your web server's `public_html` (or `htdocs`) directory.
3.  Upload the `private` folder to a location **outside** your web root (e.g., directly under your home directory on the hosting server). This is crucial for security.

### 3.2. Configure `.env` File

1.  Navigate to the `private/backend` directory.
2.  Copy the `.env.example` file to a new file named `.env`.
3.  Open the `.env` file and configure the following:
    - `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` with your database details.
    - `APP_URL` with your domain name.
    - `APP_KEY`, `JWT_SECRET`, `ENCRYPTION_KEY` with your generated keys.
    - `MAIL_` settings for email functionality.

### 3.3. Import Database Schema

1.  In your hosting control panel, open **phpMyAdmin**.
2.  Select your newly created database.
3.  Click on the **Import** tab.
4.  Upload the `schema.sql` file (located in `private/backend/database/`) and click **Go**.

### 3.4. Configure `.htaccess`

- The provided `.htaccess` file in `public_html` should work for most Apache servers. If you encounter issues, you may need to adjust the `RewriteRule` for the API to match your server's configuration.

## 4. Post-Deployment

### 4.1. Testing

- Open your domain in a web browser. You should see the React frontend.
- Test user registration, login, and other functionalities.
- Check your browser's developer console for any errors.

### 4.2. Security Hardening

- Ensure file permissions are set correctly (e.g., 755 for directories, 644 for files).
- Regularly update your dependencies and monitor for security vulnerabilities.

## 5. Maintenance and Updates

- To update the frontend, build your React app locally (`pnpm run build`) and upload the new `dist` folder contents to `public_html`.
- To update the backend, simply upload the new PHP files to the `private/backend` directory.

## 6. Troubleshooting

- **500 Internal Server Error**: Check your `.htaccess` file and PHP error logs.
- **Frontend not loading**: Check your browser's developer console for errors and ensure all files were uploaded correctly.
- **API errors**: Ensure your `.env` file is configured correctly and the backend can connect to the database.

This guide provides a comprehensive overview of the deployment process. For more detailed information, refer to the platform's documentation and your hosting provider's support resources.

