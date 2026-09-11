<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/auth.php";
setCors();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Method tidak diizinkan.", [], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$username = trim((string)($input["username"] ?? ""));
$password = (string)($input["password"] ?? "");

if ($username === "" || $password === "") {
    jsonResponse(false, "Username dan password wajib diisi.", [], 422);
}

try {
    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // Mengikuti spesifikasi database: password disimpan dengan MD5.
    if (!$user || !hash_equals($user["password"], md5($password))) {
        jsonResponse(false, "Username atau password salah.", [], 401);
    }

    unset($user["password"]);
    jsonResponse(true, "Login berhasil.", [
        "token" => createToken($user["username"]),
        "user" => $user
    ]);
} catch (Throwable $e) {
    jsonResponse(false, "Login gagal.", [], 500);
}
?>