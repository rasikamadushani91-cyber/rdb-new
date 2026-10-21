<?php
require "db.php";

try {
    $pdo->query("SELECT 1");
    echo "Database connected successfully!";
} catch (PDOException $e) {
    http_response_code(500);
    echo "Database test failed.";
}