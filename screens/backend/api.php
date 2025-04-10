<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// Check and create necessary tables
$tables = [
    "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(20) DEFAULT '#000000',
        user_id INT,
        UNIQUE KEY unique_category_per_user (name, user_id)
    )",
    "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        due_date DATE,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('pending', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )"
];

foreach ($tables as $sql) {
    if (!$conn->query($sql)) {
        logDebug("Error creating table: " . $conn->error);
    }
}

// Insert default categories if they don't exist
$defaultCategories = [
    ['Work', '#33FF57'],
    ['Home', '#FF5733'],
    ['Study', '#3357FF'],
    ['Hobby', '#FF33F6'],
    ['Music', '#33FFF6'],
    ['Travel', '#F6FF33']
];

$checkCategory = $conn->prepare("SELECT id FROM categories WHERE name = ?");
$insertCategory = $conn->prepare("INSERT INTO categories (name, color) VALUES (?, ?)");

foreach ($defaultCategories as $category) {
    $checkCategory->bind_param("s", $category[0]);
    $checkCategory->execute();
    $result = $checkCategory->get_result();
    
    if ($result->num_rows === 0) {
        $insertCategory->bind_param("ss", $category[0], $category[1]);
        $insertCategory->execute();
    }
}

// Login API
if (isset($_GET["action"]) && $_GET["action"] == "login") {
    logDebug("Login action requested");
    
    // Get request data
    $requestData = null;
    $username = "";
    $password = "";
    
    // Support both POST JSON and GET requests
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get POST data from JSON body
        $requestBody = file_get_contents("php://input");
        logDebug("Raw request body: " . $requestBody);
        
        $data = json_decode($requestBody);
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            logDebug("JSON decode error: " . json_last_error_msg());
        } else {
            $username = isset($data->username) ? trim($data->username) : "";
            $password = isset($data->password) ? $data->password : "";
        }
    } else if ($_SERVER["REQUEST_METHOD"] == "GET") {
        // Get data from URL parameters
        $username = isset($_GET["username"]) ? trim($_GET["username"]) : "";
        $password = isset($_GET["password"]) ? $_GET["password"] : "";
    }
    
    logDebug("Login attempt for username: " . $username);
    
    if (!empty($username) && !empty($password)) {
        $sql = "SELECT * FROM users WHERE username = ?";
        logDebug("Executing SQL: " . $sql . " with username: " . $username);
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            logDebug("User found in database");
            logDebug("Comparing passwords: input vs stored");
            
            // Verify hashed password
            if (password_verify($password, $row["password"])) {
                logDebug("Login successful");
                // Include profile picture URL in the response if available
                $response = [
                    "status" => "success", 
                    "message" => "Login successful",
                    "user_id" => $row["id"]
                ];
                
                if (isset($row["profile_pic_url"]) && !empty($row["profile_pic_url"])) {
                    $response["profile_pic_url"] = $row["profile_pic_url"];
                    logDebug("Returning profile pic URL: " . $row["profile_pic_url"]);
                }
                
                logDebug("Sending response: " . json_encode($response));
                sendResponse($response);
            } else {
                logDebug("Invalid password");
                sendResponse(["status" => "error", "message" => "Invalid credentials"]);
            }
        } else {
            logDebug("User not found: " . $username);
            sendResponse(["status" => "error", "message" => "User not found"]);
        }
        $stmt->close();
    } else {
        logDebug("Missing username or password");
        sendResponse(["status" => "error", "message" => "Username and password required"]);
    }
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
// Add this endpoint for updating profile picture
if (isset($_GET["action"]) && $_GET["action"] == "updateProfilePic") {
    logDebug("updateProfilePic action requested");
    
    // Get username from request
    $username = "";
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (!empty($_POST)) {
            $username = isset($_POST["username"]) ? trim($_POST["username"]) : "";
        } else {
            // Handle JSON input
            $requestBody = file_get_contents("php://input");
            $data = json_decode($requestBody);
            if ($data !== null) {
                $username = isset($data->username) ? trim($data->username) : "";
            }
        }
    }
    
    logDebug("Update profile pic for username: " . $username);
    
    if (!empty($username)) {
        // Check if user exists
        $check_sql = "SELECT * FROM users WHERE username = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            logDebug("User found, proceeding with profile pic update");
            
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
                    
                    // Update user profile pic URL in database
                    $update_sql = "UPDATE users SET profile_pic_url = ? WHERE username = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    $update_stmt->bind_param("ss", $profilePicUrl, $username);
                    
                    if ($update_stmt->execute()) {
                        logDebug("Profile picture URL updated in database");
                        sendResponse([
                            "status" => "success", 
                            "message" => "Profile picture updated successfully",
                            "profile_pic_url" => $profilePicUrl
                        ]);
                    } else {
                        logDebug("Failed to update profile picture URL: " . $conn->error);
                        sendResponse(["status" => "error", "message" => "Failed to update profile in database"]);
                    }
                    $update_stmt->close();
                } else {
                    logDebug("Failed to move uploaded file");
                    sendResponse(["status" => "error", "message" => "Failed to process uploaded file"]);
                }
            } else {
                logDebug("No profile picture uploaded or error occurred");
                sendResponse(["status" => "error", "message" => "No profile picture provided or upload error"]);
            }
        } else {
            logDebug("User not found: " . $username);
            sendResponse(["status" => "error", "message" => "User not found"]);
        }
        $check_stmt->close();
    } else {
        logDebug("Missing username");
        sendResponse(["status" => "error", "message" => "Username required"]);
    }
}

// Get Profile API
if (isset($_GET["action"]) && $_GET["action"] == "getProfile") {
    logDebug("getProfile action requested");
    
    $username = isset($_GET["username"]) ? trim($_GET["username"]) : "";
    
    if (!empty($username)) {
        $sql = "SELECT username, profile_pic_url FROM users WHERE username = ?";
        logDebug("Executing SQL: " . $sql . " with username: " . $username);
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            logDebug("User profile found");
            sendResponse([
                "status" => "success",
                "username" => $row["username"],
                "profile_pic_url" => $row["profile_pic_url"]
            ]);
        } else {
            logDebug("User not found: " . $username);
            sendResponse(["status" => "error", "message" => "User not found"]);
        }
        $stmt->close();
    } else {
        logDebug("Missing username");
        sendResponse(["status" => "error", "message" => "Username required"]);
    }
}

// Add a test endpoint to verify API is working
if (isset($_GET["action"]) && $_GET["action"] == "test") {
    logDebug("Test endpoint accessed");
    sendResponse([
        "status" => "success", 
        "message" => "API is working", 
        "time" => date("Y-m-d H:i:s"),
        "php_version" => phpversion()
    ]);
}

// Add getTasks action
if (isset($_GET["action"]) && $_GET["action"] == "getTasks") {
    // Get parameters from either GET or POST
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    
    // If not in GET, try to get from POST body
    if ($user_id === null || $category === null) {
        $requestBody = file_get_contents("php://input");
        $data = json_decode($requestBody, true);
        if ($data !== null) {
            $user_id = $user_id ?? $data['user_id'] ?? null;
            $category = $category ?? $data['category'] ?? null;
        }
    }
    
    if ($user_id === null || $category === null) {
        logDebug("Missing user_id or category in request");
        sendResponse(['status' => 'error', 'message' => 'Missing user_id or category']);
        exit;
    }

    logDebug("Getting tasks for user_id: $user_id, category: $category");
    
    // First check if the category exists
    $categoryCheck = $conn->prepare("SELECT id FROM categories WHERE name = ?");
    $categoryCheck->bind_param("s", $category);
    $categoryCheck->execute();
    $categoryResult = $categoryCheck->get_result();
    
    if ($categoryResult->num_rows === 0) {
        logDebug("Category '$category' not found in database");
        sendResponse(['status' => 'error', 'message' => 'Category not found']);
        exit;
    }
    
    $categoryRow = $categoryResult->fetch_assoc();
    $categoryId = $categoryRow['id'];
    
    // Now get the tasks
    $stmt = $conn->prepare("SELECT t.*, c.name as category_name, c.color as category_color 
                           FROM tasks t 
                           JOIN categories c ON t.category_id = c.id 
                           WHERE t.user_id = ? AND t.category_id = ?
                           ORDER BY t.due_date ASC, t.priority DESC");
    
    if ($stmt === false) {
        logDebug("SQL prepare error: " . $conn->error);
        sendResponse(['status' => 'error', 'message' => 'Database error']);
        exit;
    }
    
    $stmt->bind_param("ii", $user_id, $categoryId);
    
    if (!$stmt->execute()) {
        logDebug("SQL execute error: " . $stmt->error);
        sendResponse(['status' => 'error', 'message' => 'Database error']);
        exit;
    }
    
    $result = $stmt->get_result();
    
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    
    logDebug("Found " . count($tasks) . " tasks");
    sendResponse(['status' => 'success', 'tasks' => $tasks]);
}

// Add addTask action
if (isset($_GET["action"]) && $_GET["action"] == "addTask") {
    if (!isset($_GET['user_id']) || !isset($_GET['category']) || !isset($_GET['title']) || !isset($_GET['description'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit;
    }

    $user_id = $_GET['user_id'];
    $category = $_GET['category'];
    $title = $_GET['title'];
    $description = $_GET['description'];
    $due_date = isset($_GET['due_date']) ? $_GET['due_date'] : null;
    $priority = isset($_GET['priority']) ? $_GET['priority'] : 'medium';

    // First get the category_id
    $stmt = $conn->prepare("SELECT id FROM categories WHERE name = ? AND user_id = ?");
    $stmt->bind_param("si", $category, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $category_row = $result->fetch_assoc();

    if (!$category_row) {
        // Create category if it doesn't exist
        $stmt = $conn->prepare("INSERT INTO categories (name, user_id) VALUES (?, ?)");
        $stmt->bind_param("si", $category, $user_id);
        $stmt->execute();
        $category_id = $conn->insert_id;
    } else {
        $category_id = $category_row['id'];
    }

    // Insert the task
    $stmt = $conn->prepare("INSERT INTO tasks (user_id, category_id, title, description, due_date, priority) 
                           VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iissss", $user_id, $category_id, $title, $description, $due_date, $priority);
    
    if ($stmt->execute()) {
        $task_id = $conn->insert_id;
        echo json_encode(['status' => 'success', 'message' => 'Task added successfully', 'task_id' => $task_id]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add task']);
    }
}

// Add deleteTask action
if (isset($_GET["action"]) && $_GET["action"] == "deleteTask") {
    if (!isset($_GET['user_id']) || !isset($_GET['task_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing user_id or task_id']);
        exit;
    }

    $user_id = $_GET['user_id'];
    $task_id = $_GET['task_id'];
    
    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $task_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Task deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete task']);
    }
}

$conn->close();
logDebug("Database connection closed");
?>