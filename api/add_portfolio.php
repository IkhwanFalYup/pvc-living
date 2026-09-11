<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/auth.php";
setCors();
requireAuth();

if ($_SERVER["REQUEST_METHOD"] !== "POST") jsonResponse(false, "Method tidak diizinkan.", [], 405);

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$title = trim((string)($data["title"] ?? ""));
$category = trim((string)($data["category"] ?? ""));
$image = trim((string)($data["image"] ?? ""));

if ($title === "") jsonResponse(false, "Judul portofolio wajib diisi.", [], 422);

try {
    $stmt = $pdo->prepare("INSERT INTO portfolios (title, category, image) VALUES (?, ?, ?)");
    $stmt->execute([$title, $category, $image]);
    jsonResponse(true, "Portofolio berhasil ditambahkan.", ["id" => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
    jsonResponse(false, "Gagal menambahkan portofolio.", [], 500);
}
?>