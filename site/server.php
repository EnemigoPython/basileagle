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

function returnData($query) {
    global $mysqli;
    $result = $mysqli->query($query);
    $jsonData = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $jsonData[] = $row;
    }
    return json_encode($jsonData);
}
echo returnData("SELECT * FROM story_text");

?>