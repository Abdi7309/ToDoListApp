<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Improve error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Log file for debugging
$logFile = __DIR__ . '/api_debug.log';
function logDebug($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    error_log("[$timestamp] $message" . PHP_EOL, 3, $logFile);
}

logDebug("API request received: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400"); // Cache preflight response for 24 hours
    exit(0);
}

// For actual requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root"; 
$password = ""; 
$dbname = "webapp";

// Ensure CORS headers are set for all responses
function sendResponse($response) {
    logDebug("Sending response: " . json_encode($response));
    header("Access-Control-Allow-Origin: *");
    echo json_encode($response);
}

// Connect to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    logDebug("Database connection failed: " . $conn->connect_error);
    sendResponse(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

logDebug("Database connection successful");

// Migration script to handle database changes
$migrationQueries = [
    // Create tables in proper order
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        is_predefined BOOLEAN DEFAULT FALSE
    )",

    "CREATE TABLE IF NOT EXISTS custom_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(50) NOT NULL,
        icon_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        category_id INT NULL,
        custom_category_id INT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_category_id) REFERENCES custom_categories(id) ON DELETE CASCADE
    )",

    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted TINYINT DEFAULT 0"
];

// Execute migrations one by one and log any errors
foreach ($migrationQueries as $sql) {
    try {
        if (!$conn->query($sql)) {
            logDebug("Error executing migration: " . $conn->error . "\nQuery: " . $sql);
        }
    } catch (Exception $e) {
        logDebug("Exception during migration: " . $e->getMessage() . "\nQuery: " . $sql);
    }
}

// Insert predefined categories if they don't exist
$predefinedCategories = ['Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby', 'All'];

$stmt = $conn->prepare("INSERT IGNORE INTO categories (name, is_predefined) VALUES (?, TRUE)");
foreach ($predefinedCategories as $category) {
    $stmt->bind_param("s", $category);
    $stmt->execute();
}

// Login API
if (isset($_GET["action"]) && $_GET["action"] == "login") {
    logDebug("Login action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        
        $data = json_decode($requestBody);
        if ($data === null) {
            throw new Exception("Invalid JSON data");
        }

        $username = isset($data->username) ? trim($data->username) : "";
        $password = isset($data->password) ? $data->password : "";
        
        if (empty($username) || empty($password)) {
            throw new Exception("Username and password required");
        }

        logDebug("Attempting login for username: " . $username);
        
        $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            logDebug("User found, verifying password");
            
            if (password_verify($password, $user["password"])) {
                logDebug("Password verified, login successful");
                sendResponse([
                    "status" => "success",
                    "message" => "Login successful",
                    "user_id" => $user["id"]
                ]);
            } else {
                logDebug("Invalid password");
                sendResponse(["status" => "error", "message" => "Invalid credentials"]);
            }
        } else {
            logDebug("User not found: " . $username);
            sendResponse(["status" => "error", "message" => "User not found"]);
        }
        
    } catch (Exception $e) {
        logDebug("Login error: " . $e->getMessage());
        sendResponse(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// Register API
if (isset($_GET["action"]) && $_GET["action"] == "register") {
    logDebug("Register action requested");
    
    // Get request data
    $username = "";
    $password = "";
    $profilePicUrl = null;
    
    // Check if it's a multipart form data or JSON
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        logDebug("POST request detected");
        
        // Check if it's multipart form data (for file uploads)
        if (!empty($_FILES) || !empty($_POST)) {
            logDebug("Multipart form data detected");
            
            $username = isset($_POST["username"]) ? trim($_POST["username"]) : "";
            $password = isset($_POST["password"]) ? $_POST["password"] : "";
            
            logDebug("Form data: username = " . $username);
            
            // Handle profile picture upload
            if (isset($_FILES["profilePic"]) && $_FILES["profilePic"]["error"] === UPLOAD_ERR_OK) {
                logDebug("Profile picture uploaded");
                
                // Create upload directory if it doesn't exist
                $uploadDir = __DIR__ . '/uploads/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                    logDebug("Created upload directory: " . $uploadDir);
                }
                
                // Generate unique filename
                $fileExtension = pathinfo($_FILES["profilePic"]["name"], PATHINFO_EXTENSION);
                $fileName = 'profile_' . time() . '_' . uniqid() . '.' . $fileExtension;
                $targetFile = $uploadDir . $fileName;
                
                // Move uploaded file
                if (move_uploaded_file($_FILES["profilePic"]["tmp_name"], $targetFile)) {
                    logDebug("File uploaded successfully to: " . $targetFile);
                    
                    // Get the relative URL path
                    $profilePicUrl = 'uploads/' . $fileName;
                    logDebug("Profile pic URL set to: " . $profilePicUrl);
                } else {
                    logDebug("Failed to upload file");
                }
            } else if (isset($_FILES["profilePic"])) {
                logDebug("Profile pic upload error: " . $_FILES["profilePic"]["error"]);
            }
        } else {
            // Handle JSON input
            logDebug("JSON input detected");
            $requestBody = file_get_contents("php://input");
            logDebug("Raw request body: " . $requestBody);
            
            $data = json_decode($requestBody);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                logDebug("JSON decode error: " . json_last_error_msg());
            } else {
                $username = isset($data->username) ? trim($data->username) : "";
                $password = isset($data->password) ? $data->password : "";
            }
        }
    } else if ($_SERVER["REQUEST_METHOD"] == "GET") {
        // Get data from URL parameters
        $username = isset($_GET["username"]) ? trim($_GET["username"]) : "";
        $password = isset($_GET["password"]) ? $_GET["password"] : "";
    }
    
    logDebug("Registration attempt for username: " . $username);
    
    if (!empty($username) && !empty($password)) {
        // Check if username already exists
        $check_sql = "SELECT * FROM users WHERE username = ?";
        logDebug("Executing SQL: " . $check_sql . " with username: " . $username);
        
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            logDebug("Username already exists");
            sendResponse(["status" => "error", "message" => "Username already exists"]);
        } else {
            // Hash the password before storing
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            // Check if profile_pic_url column exists
            $tableCheckSql = "SHOW COLUMNS FROM users LIKE 'profile_pic_url'";
            $tableCheckResult = $conn->query($tableCheckSql);
            
            if ($tableCheckResult->num_rows == 0) {
                // Add profile_pic_url column if it doesn't exist
                logDebug("Adding profile_pic_url column to users table");
                $alterTableSql = "ALTER TABLE users ADD COLUMN profile_pic_url VARCHAR(255)";
                if (!$conn->query($alterTableSql)) {
                    logDebug("Failed to add profile_pic_url column: " . $conn->error);
                }
            }
            
            // Insert new user with profile picture URL if available
            if ($profilePicUrl) {
                $sql = "INSERT INTO users (username, password, profile_pic_url) VALUES (?, ?, ?)";
                logDebug("Executing SQL: " . $sql . " with profile pic URL");
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sss", $username, $hashed_password, $profilePicUrl);
            } else {
                $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
                logDebug("Executing SQL: " . $sql . " without profile pic URL");
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $username, $hashed_password);
            }

            if ($stmt->execute()) {
                logDebug("User registered successfully");
                $response = ["status" => "success", "message" => "User registered successfully"];
                
                if ($profilePicUrl) {
                    $response["profile_pic_url"] = $profilePicUrl;
                }
                
                sendResponse($response);
            } else {
                logDebug("Registration failed: " . $conn->error);
                sendResponse(["status" => "error", "message" => "Registration failed: " . $conn->error]);
            }
            $stmt->close();
        }
        $check_stmt->close();
    } else {
        logDebug("Missing username or password");
        sendResponse(["status" => "error", "message" => "Username and password required"]);
    }
}

// Add Task API
if (isset($_GET["action"]) && $_GET["action"] == "addTask") {
    // Clear any previous output and disable error output
    ob_clean();
    ob_start();
    
    logDebug("Add Task action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        
        $data = json_decode($requestBody);
        if ($data === null) {
            throw new Exception("Invalid JSON data");
        }

        // Validate required fields
        $userId = isset($data->user_id) ? intval($data->user_id) : 0;
        $title = isset($data->title) ? trim($data->title) : "";
        $description = isset($data->description) ? trim($data->description) : "";
        $category = isset($data->category) ? trim($data->category) : "";

        logDebug("Processing task: user_id=$userId, title=$title, category=$category");

        if (empty($userId) || empty($title) || empty($category)) {
            throw new Exception("Missing required fields");
        }

        $conn->begin_transaction();

        // Check if it's a custom category first
        $stmt = $conn->prepare("SELECT id FROM custom_categories WHERE name = ? AND user_id = ?");
        $stmt->bind_param("si", $category, $userId);
        $stmt->execute();
        $customCategoryResult = $stmt->get_result();
        $customCategory = $customCategoryResult->fetch_assoc();

        // Get All category ID
        $stmt = $conn->prepare("SELECT id FROM categories WHERE name = 'All'");
        $stmt->execute();
        $allResult = $stmt->get_result();
        $allCategory = $allResult->fetch_assoc();

        if ($customCategory) {
            // Insert task with custom category
            $stmt = $conn->prepare("INSERT INTO tasks (user_id, custom_category_id, title, description) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiss", $userId, $customCategory['id'], $title, $description);
            if (!$stmt->execute()) {
                throw new Exception("Error saving task to custom category");
            }

            // Also add to All category if it exists
            if ($allCategory && $category !== 'All') {
                $stmt = $conn->prepare("INSERT INTO tasks (user_id, category_id, title, description) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiss", $userId, $allCategory['id'], $title, $description);
                if (!$stmt->execute()) {
                    throw new Exception("Error saving task to All category");
                }
            }
        } else {
            // Get predefined category ID
            $stmt = $conn->prepare("SELECT id FROM categories WHERE name = ?");
            $stmt->bind_param("s", $category);
            $stmt->execute();
            $result = $stmt->get_result();
            $categoryRow = $result->fetch_assoc();

            if (!$categoryRow) {
                throw new Exception("Category not found");
            }

            // Insert into regular category
            $stmt = $conn->prepare("INSERT INTO tasks (user_id, category_id, title, description) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiss", $userId, $categoryRow['id'], $title, $description);
            if (!$stmt->execute()) {
                throw new Exception("Error saving task to category");
            }

            // Also add to All category if it exists and this isn't already the All category
            if ($allCategory && $category !== 'All') {
                $stmt = $conn->prepare("INSERT INTO tasks (user_id, category_id, title, description) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiss", $userId, $allCategory['id'], $title, $description);
                if (!$stmt->execute()) {
                    throw new Exception("Error saving task to All category");
                }
            }
        }

        $conn->commit();
        logDebug("Task added successfully");
        header('Content-Type: application/json');
        ob_end_clean();
        echo json_encode(["status" => "success", "message" => "Task added successfully"]);
        exit();
        
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error adding task: " . $e->getMessage());
        header('Content-Type: application/json');
        ob_end_clean();
        echo json_encode(["status" => "error", "message" => "Failed to add task: " . $e->getMessage()]);
        exit();
    }
}

// Modify deleteTask action
if (isset($_GET["action"]) && $_GET["action"] == "deleteTask") {
    logDebug("deleteTask action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        
        $user_id = $data['user_id'] ?? null;
        $task_id = $data['task_id'] ?? null;

        if (!$user_id || !$task_id) {
            throw new Exception("Missing user_id or task_id");
        }

        $conn->begin_transaction();

        // Get the task details
        $stmt = $conn->prepare("
            SELECT title, description
            FROM tasks 
            WHERE id = ? AND user_id = ? AND deleted = 0
        ");
        
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();
        $task = $stmt->get_result()->fetch_assoc();

        if (!$task) {
            throw new Exception("Task not found");
        }

        // Soft delete all instances of this task across categories
        $stmt = $conn->prepare("
            UPDATE tasks 
            SET deleted = 1 
            WHERE user_id = ? 
            AND title = ? 
            AND description = ?
        ");
        $stmt->bind_param("iss", $user_id, $task['title'], $task['description']);
        $stmt->execute();

        $conn->commit();
        sendResponse(['status' => 'success', 'message' => 'Task deleted successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in deleteTask: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Modify getDeletedTasks endpoint
if (isset($_GET["action"]) && $_GET["action"] == "getDeletedTasks") {
    logDebug("getDeletedTasks action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        
        $userId = $data['user_id'] ?? null;

        if (!$userId) {
            throw new Exception("User ID is required");
        }

        $query = "
            SELECT DISTINCT
                t.id,
                t.title,
                t.description,
                t.created_at,
                COALESCE(c.name, cc.name) as category_name
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN custom_categories cc ON t.custom_category_id = cc.id
            WHERE t.user_id = ? 
            AND t.deleted = 1
            AND COALESCE(c.name, cc.name) != 'All'
            ORDER BY t.created_at DESC
        ";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to get deleted tasks");
        }
        
        $result = $stmt->get_result();
        $tasks = [];
        
        while ($row = $result->fetch_assoc()) {
            $tasks[] = [
                'id' => intval($row['id']),
                'title' => $row['title'],
                'description' => $row['description'],
                'category_name' => $row['category_name'],
                'created_at' => $row['created_at']
            ];
        }

        sendResponse([
            "status" => "success",
            "tasks" => $tasks
        ]);
    } catch (Exception $e) {
        logDebug("Error in getDeletedTasks: " . $e->getMessage());
        sendResponse(["status" => "error", "message" => $e->getMessage()]);
    }
}

// Modify restoreTask endpoint to restore in both category and All
if (isset($_GET["action"]) && $_GET["action"] == "restoreTask") {
    logDebug("restoreTask action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        
        $user_id = $data['user_id'] ?? null;
        $task_id = $data['task_id'] ?? null;

        if (!$user_id || !$task_id) {
            throw new Exception("Missing user_id or task_id");
        }

        $conn->begin_transaction();

        // Get the task details
        $stmt = $conn->prepare("
            SELECT title, description 
            FROM tasks 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();
        $task = $stmt->get_result()->fetch_assoc();

        if (!$task) {
            throw new Exception("Task not found");
        }

        // Restore all instances of this task
        $stmt = $conn->prepare("
            UPDATE tasks 
            SET deleted = 0 
            WHERE user_id = ? 
            AND title = ? 
            AND description = ?
        ");
        $stmt->bind_param("iss", $user_id, $task['title'], $task['description']);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to restore task");
        }

        $conn->commit();
        sendResponse(['status' => 'success', 'message' => 'Task restored successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in restoreTask: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Modify getTasks query to exclude deleted items
if (isset($_GET["action"]) && $_GET["action"] == "getTasks") {
    logDebug("getTasks action requested");
    
    try {
        // Clear any previous output
        ob_clean();
        
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        
        $data = json_decode($requestBody);
        if ($data === null) {
            throw new Exception("Invalid JSON data: " . json_last_error_msg());
        }

        $userId = isset($data->user_id) ? intval($data->user_id) : 0;
        $category = isset($data->category) ? trim($data->category) : "";

        logDebug("Processing request - user_id: $userId, category: $category");

        if (empty($userId) || empty($category)) {
            throw new Exception("Missing user_id or category");
        }

        $query = "
            SELECT 
                t.id,
                t.title,
                t.description,
                t.created_at,
                COALESCE(c.name, cc.name) as category_name
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN custom_categories cc ON t.custom_category_id = cc.id
            WHERE t.user_id = ? 
            AND t.deleted = 0 
            AND (
                (c.name = ? AND t.category_id IS NOT NULL) OR 
                (cc.name = ? AND t.custom_category_id IS NOT NULL)
            )
            ORDER BY t.created_at DESC
        ";

        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Database error: " . $conn->error);
        }

        $stmt->bind_param("iss", $userId, $category, $category);
        if (!$stmt->execute()) {
            throw new Exception("Failed to execute tasks query: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $tasks = [];
        
        while ($row = $result->fetch_assoc()) {
            $tasks[] = [
                'id' => intval($row['id']),
                'title' => $row['title'],
                'description' => $row['description'],
                'category_name' => $row['category_name'],
                'created_at' => $row['created_at']
            ];
        }

        logDebug("Found " . count($tasks) . " tasks");
        logDebug("Sending response: " . json_encode(["status" => "success", "tasks" => $tasks]));
        
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "tasks" => $tasks
        ]);
        exit();
        
    } catch (Exception $e) {
        logDebug("Error: " . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
}

// Get Categories API
if (isset($_GET["action"]) && $_GET["action"] == "getCategories") {
    logDebug("getCategories action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        
        $data = json_decode($requestBody);
        if ($data === null) {
            throw new Exception("Invalid JSON data");
        }

        $userId = isset($data->user_id) ? intval($data->user_id) : 0;
        if (empty($userId)) {
            throw new Exception("User ID is required");
        }

        // Get predefined categories plus user's custom categories
        $query = "
            SELECT 
                'predefined' as type,
                id,
                name,
                NULL as icon_url,
                NULL as user_id
            FROM categories 
            WHERE is_predefined = TRUE
            UNION
            SELECT 
                'custom' as type,
                id,
                name,
                icon_url,
                user_id
            FROM custom_categories 
            WHERE user_id = ?
            ORDER BY name";

        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Database error: " . $conn->error);
        }

        $stmt->bind_param("i", $userId);
        if (!$stmt->execute()) {
            throw new Exception("Failed to execute query: " . $stmt->error);
        }

        $result = $stmt->get_result();
        $categories = [];
        
        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'id' => intval($row['id']),
                'name' => $row['name'],
                'icon_url' => $row['icon_url'],
                'type' => $row['type'],
                'user_id' => $row['user_id'] ? intval($row['user_id']) : null
            ];
        }

        logDebug("Found " . count($categories) . " categories");
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "categories" => $categories
        ]);
        exit();
        
    } catch (Exception $e) {
        logDebug("Error: " . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
}

// Add permanent delete endpoint
if (isset($_GET["action"]) && $_GET["action"] == "permanentDelete") {
    logDebug("permanentDelete action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        
        $user_id = $data['user_id'] ?? null;
        $task_id = $data['task_id'] ?? null;

        if (!$user_id || !$task_id) {
            throw new Exception("Missing user_id or task_id");
        }

        $conn->begin_transaction();

        // Get the task details
        $stmt = $conn->prepare("
            SELECT title, description
            FROM tasks 
            WHERE id = ? AND user_id = ? AND deleted = 1
        ");
        
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();
        $task = $stmt->get_result()->fetch_assoc();

        if (!$task) {
            throw new Exception("Task not found");
        }

        // Permanently delete all instances of this task
        $stmt = $conn->prepare("
            DELETE FROM tasks 
            WHERE user_id = ? 
            AND title = ? 
            AND description = ?
            AND deleted = 1
        ");
        $stmt->bind_param("iss", $user_id, $task['title'], $task['description']);
        $stmt->execute();

        $conn->commit();
        sendResponse(['status' => 'success', 'message' => 'Task permanently deleted']);
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in permanentDelete: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn->close();
logDebug("Database connection closed");
?>