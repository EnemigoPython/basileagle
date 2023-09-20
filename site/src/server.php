<?php

$envFile = realpath('.env');
foreach(file($envFile) as $line) {
    list($key, $value) = explode("=", $line);
    $value = trim(strtr($value, ["'" => ''])); // remove syntax from .env
    $envVars[$key] = $value;
}

$host_name = $envVars['host_name'];
$database = $envVars['database'];
$user_name = $envVars['user_name'];
$password = $envVars['password'];
$mysqli = new mysqli($host_name, $user_name, $password, $database);
if ($mysqli->connect_error) {
    die('<p>Failed to connect to MySQL: '. $mysqli->connect_error .'</p>');
} else {
    echo '<p>Connection to MySQL server successfully established.</p>';
}

function returnData($query) {
    global $mysqli;
    $result = $mysqli->query($query);
    $jsonData = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $jsonData[] = $row;
    }
    return json_encode($jsonData);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    switch ($_GET['action']) {
        case "storyText":
            echo returnData('SELECT * FROM `story_text`');
            exit;
        case "test":
            mail("basileagle@gmail.com", "new message", "new message");
            exit;
        default:
            echo json_encode(null);
            exit;
    }
}
?>