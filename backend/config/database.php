<?php
/**
 * Modern Green Eco CTF Platform
 * Secure Database Configuration
 * 
 * This file provides secure database connection and configuration
 * with proper error handling and security measures.
 */

class Database {
    private static $instance = null;
    private $connection;
    private $host;
    private $database;
    private $username;
    private $password;
    private $charset;

    private function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->database = $_ENV['DB_DATABASE'] ?? 'ctf_platform';
        $this->username = $_ENV['DB_USERNAME'] ?? 'ctf_user';
        $this->password = $_ENV['DB_PASSWORD'] ?? '';
        $this->charset = 'utf8mb4';
        
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    /**
     * Execute a prepared statement with parameters
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query failed: " . $e->getMessage() . " SQL: " . $sql);
            throw new Exception("Database query failed");
        }
    }

    /**
     * Fetch a single row
     */
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Fetch all rows
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Insert data and return last insert ID
     */
    public function insert($table, $data) {
        $columns = implode(',', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);
        
        return $this->connection->lastInsertId();
    }

    /**
     * Update data
     */
    public function update($table, $data, $where) {
        $setClause = [];
        foreach (array_keys($data) as $key) {
            $setClause[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setClause);

        $whereClause = [];
        foreach (array_keys($where) as $key) {
            $whereClause[] = "{$key} = :where_{$key}";
        }
        $whereClause = implode(' AND ', $whereClause);

        $sql = "UPDATE {$table} SET {$setClause} WHERE {$whereClause}";
        
        // Merge data and where parameters with prefixed where keys
        $params = $data;
        foreach ($where as $key => $value) {
            $params["where_{$key}"] = $value;
        }

        return $this->query($sql, $params);
    }

    /**
     * Delete data
     */
    public function delete($table, $where) {
        $whereClause = [];
        foreach (array_keys($where) as $key) {
            $whereClause[] = "{$key} = :{$key}";
        }
        $whereClause = implode(' AND ', $whereClause);

        $sql = "DELETE FROM {$table} WHERE {$whereClause}";
        return $this->query($sql, $where);
    }

    /**
     * Count rows
     */
    public function count($table, $where = []) {
        $sql = "SELECT COUNT(*) as count FROM {$table}";
        
        if (!empty($where)) {
            $whereClause = [];
            foreach (array_keys($where) as $key) {
                $whereClause[] = "{$key} = :{$key}";
            }
            $sql .= " WHERE " . implode(' AND ', $whereClause);
        }

        $result = $this->fetchOne($sql, $where);
        return (int) $result['count'];
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollback();
    }

    /**
     * Check if table exists
     */
    public function tableExists($table) {
        $sql = "SHOW TABLES LIKE :table";
        $result = $this->fetchOne($sql, ['table' => $table]);
        return !empty($result);
    }
}

// Global database helper functions for backward compatibility
function db() {
    return Database::getInstance();
}

function db_query($sql, $params = []) {
    return db()->query($sql, $params);
}

function db_fetch_one($sql, $params = []) {
    return db()->fetchOne($sql, $params);
}

function db_fetch_all($sql, $params = []) {
    return db()->fetchAll($sql, $params);
}

function db_insert($table, $data) {
    return db()->insert($table, $data);
}

function db_update($table, $data, $where) {
    return db()->update($table, $data, $where);
}

function db_delete($table, $where) {
    return db()->delete($table, $where);
}

function db_count($table, $where = []) {
    return db()->count($table, $where);
}

