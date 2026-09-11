<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/auth.php";
setCors();
requireAuth();

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") jsonResponse(false, "Method tidak diizinkan.", [], 405);

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$id = filter_var($data["id"] ?? null, FILTER_VALIDATE_INT);
if ($id === false || $id < 1) jsonResponse(false, "ID portofolio tidak valid.", [], 422);

try {
    $stmt = $pdo->prepare("DELETE FROM portfolios WHERE id=?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) jsonResponse(false, "Portofolio tidak ditemukan.", [], 404);
    jsonResponse(true, "Portofolio berhasil dihapus.");
} catch (Throwable $e) {
    jsonResponse(false, "Gagal menghapus portofolio.", [], 500);
}
?>