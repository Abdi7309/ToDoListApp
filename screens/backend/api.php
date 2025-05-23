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
    logDebug("Add Task action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        $data = json_decode($requestBody);
        
        if ($data === null) {
            throw new Exception("Invalid JSON data");
        }

        $userId = isset($data->user_id) ? intval($data->user_id) : 0;
        $title = isset($data->title) ? trim($data->title) : "";
        $description = isset($data->description) ? trim($data->description) : "";
        $category = isset($data->category) ? trim($data->category) : "";
        $isCustom = isset($data->isCustom) ? (bool)$data->isCustom : false;

        logDebug("Processing task: userId=$userId, category=$category, isCustom=" . ($isCustom ? "true" : "false"));

        if (empty($userId) || empty($title) || empty($category)) {
            throw new Exception("Missing required fields");
        }

        $conn->begin_transaction();

        // First add task to specified category
        if ($isCustom) {
            // Get the custom category ID
            $stmt = $conn->prepare("SELECT id FROM custom_categories WHERE name = ? AND user_id = ?");
            $stmt->bind_param("si", $category, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($categoryData = $result->fetch_assoc()) {
                $categoryId = $categoryData['id'];
                
                // Add to custom category
                $stmt = $conn->prepare("INSERT INTO tasks (user_id, custom_category_id, title, description) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiss", $userId, $categoryId, $title, $description);
                if (!$stmt->execute()) {
                    throw new Exception("Failed to add task to custom category");
                }
            }
        } else {
            // Add to predefined category
            $stmt = $conn->prepare("
                INSERT INTO tasks (user_id, category_id, title, description) 
                SELECT ?, id, ?, ? FROM categories WHERE name = ?
            ");
            $stmt->bind_param("isss", $userId, $title, $description, $category);
            if (!$stmt->execute()) {
                throw new Exception("Failed to add task to category");
            }
        }

        // Then add to All category if this isn't already the All category
        if ($category !== 'All') {
            $stmt = $conn->prepare("
                INSERT INTO tasks (user_id, category_id, title, description) 
                SELECT ?, id, ?, ? FROM categories WHERE name = 'All'
            ");
            $stmt->bind_param("iss", $userId, $title, $description);
            if (!$stmt->execute()) {
                throw new Exception("Failed to add task to All category");
            }
        }

        $conn->commit();
        logDebug("Task added successfully");
        sendResponse(['status' => 'success', 'message' => 'Task added successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in addTask: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
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
        $prev_task_id = $data['prev_task_id'] ?? null;
        $next_task_id = $data['next_task_id'] ?? null;

        if (!$user_id || !$task_id) {
            throw new Exception("Missing user_id or task_id");
        }

        $conn->begin_transaction();

        // Delete current task
        $stmt = $conn->prepare("
            UPDATE tasks 
            SET deleted = 1 
            WHERE id = ? AND user_id = ? AND deleted = 0
        ");
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();

        // If prev_task_id is provided (for All category), delete previous task
        if ($prev_task_id) {
            $stmt = $conn->prepare("
                UPDATE tasks 
                SET deleted = 1 
                WHERE id = ? AND user_id = ? AND deleted = 0
            ");
            $stmt->bind_param("ii", $prev_task_id, $user_id);
            $stmt->execute();
        }
        // If next_task_id is provided (for other categories), delete next task
        else if ($next_task_id) {
            $stmt = $conn->prepare("
                UPDATE tasks 
                SET deleted = 1 
                WHERE id = ? AND user_id = ? AND deleted = 0
            ");
            $stmt->bind_param("ii", $next_task_id, $user_id);
            $stmt->execute();
        }

        $conn->commit();
        sendResponse(['status' => 'success', 'message' => 'Tasks deleted successfully']);
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
        $next_task_id = $data['next_task_id'] ?? null;

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

        // Restore current task
        $stmt = $conn->prepare("
            UPDATE tasks 
            SET deleted = 0 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();

        // Restore next task if it exists
        if ($next_task_id) {
            $stmt = $conn->prepare("
                UPDATE tasks 
                SET deleted = 0 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("ii", $next_task_id, $user_id);
            $stmt->execute();
        }

        $conn->commit();
        sendResponse(['status' => 'success', 'message' => 'Tasks restored successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in restoreTask: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Add checkDeletedTask endpoint
if (isset($_GET["action"]) && $_GET["action"] == "checkDeletedTask") {
    $data = json_decode(file_get_contents("php://input"));
    $userId = $data->user_id ?? null;
    $title = $data->title ?? null;
    $description = $data->description ?? null;
    $category = $data->category ?? null;

    // Check for deleted task with same title and description, regardless of category
    $stmt = $conn->prepare("
        SELECT t.id 
        FROM tasks t
        WHERE t.user_id = ? 
        AND t.title = ? 
        AND t.description = ?
        AND t.deleted = 1
        LIMIT 1
    ");

    $stmt->bind_param("iss", $userId, $title, $description);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        sendResponse(['status' => 'found', 'task_id' => $row['id']]);
    } else {
        sendResponse(['status' => 'not_found']);
    }
    exit();
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

// Add Custom Category API
if (isset($_GET["action"]) && $_GET["action"] == "addCustomCategory") {
    logDebug("addCustomCategory action requested");
    
    try {
        $user_id = isset($_POST["user_id"]) ? intval($_POST["user_id"]) : 0;
        $name = isset($_POST["name"]) ? trim($_POST["name"]) : "";
        
        if (!$user_id || empty($name)) {
            throw new Exception("User ID and category name are required");
        }

        // Check if category name already exists for this user
        $stmt = $conn->prepare("
            SELECT id FROM custom_categories 
            WHERE user_id = ? AND name = ?
        ");
        $stmt->bind_param("is", $user_id, $name);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception("Category name already exists");
        }

        $icon_url = null;
        // Handle icon upload if present
        if (isset($_FILES['icon']) && $_FILES['icon']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/uploads/categories/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileExtension = pathinfo($_FILES['icon']['name'], PATHINFO_EXTENSION);
            $fileName = 'category_' . time() . '_' . uniqid() . '.' . $fileExtension;
            $targetFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['icon']['tmp_name'], $targetFile)) {
                $icon_url = 'uploads/categories/' . $fileName;
            }
        }

        // Insert the new category
        if ($icon_url) {
            $stmt = $conn->prepare("
                INSERT INTO custom_categories (user_id, name, icon_url) 
                VALUES (?, ?, ?)
            ");
            $stmt->bind_param("iss", $user_id, $name, $icon_url);
        } else {
            $stmt = $conn->prepare("
                INSERT INTO custom_categories (user_id, name) 
                VALUES (?, ?)
            ");
            $stmt->bind_param("is", $user_id, $name);
        }

        if (!$stmt->execute()) {
            throw new Exception("Failed to create category");
        }

        sendResponse([
            "status" => "success", 
            "message" => "Category created successfully",
            "icon_url" => $icon_url
        ]);

    } catch (Exception $e) {
        logDebug("Error in addCustomCategory: " . $e->getMessage());
        sendResponse(["status" => "error", "message" => $e->getMessage()]);
    }
}

// Update Category API
if (isset($_GET["action"]) && $_GET["action"] == "updateCategory") {
    logDebug("updateCategory action requested");
    
    try {
        $user_id = isset($_POST["user_id"]) ? intval($_POST["user_id"]) : 0;
        $category_id = isset($_POST["category_id"]) ? intval($_POST["category_id"]) : 0;
        $name = isset($_POST["name"]) ? trim($_POST["name"]) : "";
        
        if (!$user_id || !$category_id || empty($name)) {
            throw new Exception("User ID, category ID and name are required");
        }

        // Check if new name already exists for this user (excluding current category)
        $stmt = $conn->prepare("
            SELECT id FROM custom_categories 
            WHERE user_id = ? AND name = ? AND id != ?
        ");
        $stmt->bind_param("isi", $user_id, $name, $category_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception("Category name already exists");
        }

        $conn->begin_transaction();

        // Handle new icon upload if present
        if (isset($_FILES['icon']) && $_FILES['icon']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/uploads/categories/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileExtension = pathinfo($_FILES['icon']['name'], PATHINFO_EXTENSION);
            $fileName = 'category_' . time() . '_' . uniqid() . '.' . $fileExtension;
            $targetFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['icon']['tmp_name'], $targetFile)) {
                // Delete old icon if exists
                $stmt = $conn->prepare("SELECT icon_url FROM custom_categories WHERE id = ? AND user_id = ?");
                $stmt->bind_param("ii", $category_id, $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($oldIcon = $result->fetch_assoc()) {
                    if ($oldIcon['icon_url']) {
                        $oldIconPath = __DIR__ . '/' . $oldIcon['icon_url'];
                        if (file_exists($oldIconPath)) {
                            unlink($oldIconPath);
                        }
                    }
                }

                // Update category with new icon
                $icon_url = 'uploads/categories/' . $fileName;
                $stmt = $conn->prepare("
                    UPDATE custom_categories 
                    SET name = ?, icon_url = ?
                    WHERE id = ? AND user_id = ?
                ");
                $stmt->bind_param("ssii", $name, $icon_url, $category_id, $user_id);
            }
        } else {
            // Update only the name
            $stmt = $conn->prepare("
                UPDATE custom_categories 
                SET name = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("sii", $name, $category_id, $user_id);
        }

        if (!$stmt->execute()) {
            throw new Exception("Failed to update category");
        }

        // Update category name in tasks
        $stmt = $conn->prepare("
            UPDATE tasks 
            SET title = CONCAT(?, ' - ', SUBSTRING_INDEX(title, ' - ', -1))
            WHERE custom_category_id = ? AND user_id = ?
        ");
        $stmt->bind_param("sii", $name, $category_id, $user_id);
        $stmt->execute();

        $conn->commit();
        sendResponse(["status" => "success", "message" => "Category updated successfully"]);

    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in updateCategory: " . $e->getMessage());
        sendResponse(["status" => "error", "message" => $e->getMessage()]);
    }
}

// Delete Category API
if (isset($_GET["action"]) && $_GET["action"] == "deleteCategory") {
    logDebug("deleteCategory action requested");
    
    try {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        
        $user_id = $data['user_id'] ?? null;
        $category_id = $data['category_id'] ?? null;

        if (!$user_id || !$category_id) {
            throw new Exception("User ID and category ID are required");
        }

        $conn->begin_transaction();

        // Get all tasks from the custom category in order
        $stmt = $conn->prepare("
            SELECT id 
            FROM tasks 
            WHERE user_id = ? 
            AND custom_category_id = ?
            ORDER BY id ASC
        ");
        $stmt->bind_param("ii", $user_id, $category_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row['id'];
        }

        // Delete tasks in pairs (assuming even IDs are custom category and odd IDs are All category)
        for ($i = 0; $i < count($tasks); $i++) {
            $taskId = $tasks[$i];
            $nextId = $taskId + 1;  // The corresponding All category task ID

            // Delete both tasks
            $stmt = $conn->prepare("DELETE FROM tasks WHERE id IN (?, ?)");
            $stmt->bind_param("ii", $taskId, $nextId);
            $stmt->execute();
        }

        // Delete the custom category itself
        $stmt = $conn->prepare("DELETE FROM custom_categories WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $category_id, $user_id);
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete category");
        }

        // Delete the category icon if it exists
        $stmt = $conn->prepare("SELECT icon_url FROM custom_categories WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $category_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($icon = $result->fetch_assoc()) {
            if ($icon['icon_url']) {
                $iconPath = __DIR__ . '/' . $icon['icon_url'];
                if (file_exists($iconPath)) {
                    unlink($iconPath);
                }
            }
        }

        $conn->commit();
        sendResponse(["status" => "success", "message" => "Category and all its tasks deleted successfully"]);

    } catch (Exception $e) {
        $conn->rollback();
        logDebug("Error in deleteCategory: " . $e->getMessage());
        sendResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn->close();
logDebug("Database connection closed");
?>