<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/auth.php";
setCors();

try {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    jsonResponse(false, "Gagal mengambil data produk.", [], 500);
}
?>