<?php
// Minimal webhook proxy for static hosting (PHP required).
// Reads credentials from webhook-proxy.config.php (not committed).

header('Content-Type: application/json; charset=utf-8');

function send_json_response($statusCode, $payload)
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function parse_response_status($headers)
{
    if (!is_array($headers)) {
        return 0;
    }

    $statusCode = 0;
    foreach ($headers as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', (string)$header, $matches)) {
            $statusCode = (int)$matches[1];
        }
    }

    return $statusCode;
}

function post_json_to_webhook($webhookUrl, $webhookAuth, $payload)
{
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        return [
            'ok' => false,
            'status' => 0,
            'body' => '',
            'error' => 'Payload konnte nicht serialisiert werden.',
        ];
    }

    $headers = [
        'Content-Type: application/json',
        'Authorization: ' . $webhookAuth,
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($webhookUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $responseBody = is_string($response) ? substr($response, $headerSize) : '';

        return [
            'ok' => $response !== false,
            'status' => $httpCode,
            'body' => $responseBody,
            'error' => $response === false ? $curlError : '',
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'ignore_errors' => true,
            'timeout' => 30,
        ],
    ]);

    $responseBody = @file_get_contents($webhookUrl, false, $context);
    $responseHeaders = function_exists('http_get_last_response_headers')
        ? http_get_last_response_headers()
        : [];
    $statusCode = parse_response_status($responseHeaders);

    return [
        'ok' => $responseBody !== false,
        'status' => $statusCode,
        'body' => is_string($responseBody) ? $responseBody : '',
        'error' => $responseBody === false ? 'Webhook request failed.' : '',
    ];
}

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
    send_json_response(405, [
        'success' => false,
        'code' => 'METHOD_NOT_ALLOWED',
        'message' => 'Nur Formular-POSTs sind erlaubt.',
    ]);
}

$configFile = __DIR__ . '/webhook-proxy.config.php';
if (!file_exists($configFile)) {
    send_json_response(500, [
        'success' => false,
        'code' => 'PROXY_NOT_CONFIGURED',
        'message' => 'Webhook-Proxy ist nicht konfiguriert.',
    ]);
}

$config = require $configFile;
$webhookUrl = isset($config['webhook_url']) ? $config['webhook_url'] : '';
$webhookAuth = isset($config['webhook_auth']) ? $config['webhook_auth'] : '';

if (!$webhookUrl || !$webhookAuth) {
    send_json_response(500, [
        'success' => false,
        'code' => 'WEBHOOK_CREDENTIALS_MISSING',
        'message' => 'Webhook-Zugangsdaten fehlen.',
    ]);
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);
if (!is_array($data)) {
    send_json_response(400, [
        'success' => false,
        'code' => 'INVALID_JSON',
        'message' => 'Ungültige Anfrage. Bitte erneut senden.',
    ]);
}

// Basic validation for required fields.
$missing = [];
foreach (['name', 'email', 'message'] as $field) {
    if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
        $missing[] = $field;
    }
}
if (!empty($missing)) {
    send_json_response(400, [
        'success' => false,
        'code' => 'VALIDATION_ERROR',
        'missingFields' => $missing,
        'message' => 'Bitte Pflichtfelder ausfüllen.'
    ]);
}

$payload = $data;
if (!isset($payload['source']) || trim((string)$payload['source']) === '') {
    $payload['source'] = 'final_cta';
}
if (!isset($payload['timestamp']) || trim((string)$payload['timestamp']) === '') {
    $payload['timestamp'] = gmdate('c');
}
if (!isset($payload['userAgent'])) {
    $payload['userAgent'] = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
}

$webhookResponse = post_json_to_webhook($webhookUrl, $webhookAuth, $payload);

if (!$webhookResponse['ok']) {
    send_json_response(502, [
        'success' => false,
        'code' => 'WEBHOOK_REQUEST_FAILED',
        'message' => 'Senden fehlgeschlagen.',
    ]);
}

$httpCode = $webhookResponse['status'] ?: 502;
$responseBody = trim((string)$webhookResponse['body']);
$decodedResponse = $responseBody !== '' ? json_decode($responseBody, true) : null;

if ($httpCode >= 200 && $httpCode < 300) {
    $serverMessage = is_array($decodedResponse) && isset($decodedResponse['message'])
        ? trim((string)$decodedResponse['message'])
        : '';

    send_json_response(200, [
        'success' => true,
        'code' => is_array($decodedResponse) && isset($decodedResponse['code'])
            ? (string)$decodedResponse['code']
            : 'LEAD_ACCEPTED',
        'message' => $serverMessage !== '' ? $serverMessage : 'Anfrage angekommen',
    ]);
}

if (is_array($decodedResponse)) {
    $decodedResponse['success'] = false;
    if (!isset($decodedResponse['message'])) {
        $decodedResponse['message'] = 'Senden fehlgeschlagen.';
    }
    send_json_response($httpCode, $decodedResponse);
}

send_json_response($httpCode, [
    'success' => false,
    'code' => 'WEBHOOK_ERROR',
    'message' => 'Senden fehlgeschlagen.',
]);
