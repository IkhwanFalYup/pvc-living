<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/auth.php";
setCors();
requireAuth();

if ($_SERVER["REQUEST_METHOD"] !== "POST") jsonResponse(false, "Method tidak diizinkan.", [], 405);

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$name = trim((string)($data["name"] ?? ""));
$code = trim((string)($data["code"] ?? ""));
$price = filter_var($data["price"] ?? null, FILTER_VALIDATE_INT);
$stock = filter_var($data["stock"] ?? null, FILTER_VALIDATE_INT);
$category = trim((string)($data["category"] ?? ""));
$image = trim((string)($data["image"] ?? ""));
$description = trim((string)($data["description"] ?? ""));

if ($name === "" || $code === "") jsonResponse(false, "Nama dan kode produk wajib diisi.", [], 422);
if ($price === false || $price < 0) jsonResponse(false, "Harga tidak boleh negatif.", [], 422);
if ($stock === false || $stock < 0) jsonResponse(false, "Stok tidak boleh negatif.", [], 422);
if (!in_array($category, ["Panel PVC","Plafon PVC","Aksesoris"], true)) $category = "Panel PVC";

try {
    $stmt = $pdo->prepare("INSERT INTO products (name, code, price, stock, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $code, $price, $stock, $category, $image, $description]);
    jsonResponse(true, "Produk berhasil ditambahkan.", ["id" => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    if ((int)$e->errorInfo[1] === 1062) jsonResponse(false, "Kode produk sudah digunakan.", [], 409);
    jsonResponse(false, "Gagal menambahkan produk.", [], 500);
}
?>