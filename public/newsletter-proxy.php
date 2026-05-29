<?php
// Minimal newsletter proxy for static hosting (PHP required).
// Reads credentials from newsletter-proxy.config.php (not committed).

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

$allowedOrigin = 'https://codariq.de';
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$configFile = __DIR__ . '/newsletter-proxy.config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Newsletter proxy not configured']);
    exit;
}

$config = require $configFile;
$webhookUrl = isset($config['webhook_url']) ? $config['webhook_url'] : '';
$webhookAuth = isset($config['webhook_auth']) ? $config['webhook_auth'] : '';

if (!$webhookUrl || !$webhookAuth) {
    http_response_code(500);
    echo json_encode(['error' => 'Newsletter credentials missing']);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

$email = isset($data['email']) ? trim((string)$data['email']) : '';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'code' => 'VALIDATION_ERROR',
        'message' => 'Bitte gib eine gültige E-Mail-Adresse ein.'
    ]);
    exit;
}

$payload = [
    'email' => $email,
    'source' => isset($data['source']) ? (string)$data['source'] : 'footer_newsletter',
    'timestamp' => isset($data['timestamp']) ? (string)$data['timestamp'] : gmdate('c'),
    'userAgent' => isset($data['userAgent']) ? (string)$data['userAgent'] : '',
];

$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: ' . $webhookAuth,
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
]);

$responseBody = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

if ($responseBody === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Newsletter request failed', 'details' => $curlError]);
    exit;
}

http_response_code($httpCode ?: 502);
echo $responseBody ?: '';
