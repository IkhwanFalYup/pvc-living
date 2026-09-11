<?php
declare(strict_types=1);

const API_SECRET = "PVC_LIVING_SECRET_2026_CHANGE_THIS";

function jsonResponse(bool $success, string $message = "", array $data = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $data), JSON_UNESCAPED_UNICODE);
    exit;
}

function getBearerToken(): string {
    $header = $_SERVER["HTTP_AUTHORIZATION"] ?? "";
    if (!$header && function_exists("getallheaders")) {
        $headers = getallheaders();
        $header = $headers["Authorization"] ?? $headers["authorization"] ?? "";
    }
    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return "";
}

function createToken(string $username): string {
    $timestamp = time();
    $signature = hash_hmac("sha256", $username . "|" . $timestamp, API_SECRET);
    return base64_encode($username . "|" . $timestamp . "|" . $signature);
}

function requireAuth(): string {
    $token = getBearerToken();
    if ($token === "") {
        jsonResponse(false, "Token autentikasi diperlukan.", [], 401);
    }

    $decoded = base64_decode($token, true);
    $parts = $decoded !== false ? explode("|", $decoded) : [];

    if (count($parts) !== 3) {
        jsonResponse(false, "Token tidak valid.", [], 401);
    }

    [$username, $timestamp, $signature] = $parts;
    if ($username === "" || !ctype_digit($timestamp)) {
        jsonResponse(false, "Token tidak valid.", [], 401);
    }

    // Token berlaku 8 jam.
    if (abs(time() - (int)$timestamp) > 28800) {
        jsonResponse(false, "Token telah kedaluwarsa. Silakan login kembali.", [], 401);
    }

    $expected = hash_hmac("sha256", $username . "|" . $timestamp, API_SECRET);
    if (!hash_equals($expected, $signature)) {
        jsonResponse(false, "Token tidak valid.", [], 401);
    }

    return $username;
}

function setCors(): void {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");
    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
        http_response_code(204);
        exit;
    }
}
?>