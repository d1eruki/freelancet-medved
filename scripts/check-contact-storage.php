<?php

// Workflow подставляет одноразовый токен и временно загружает файл в public_html/api/.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$token = '__CONTACT_STORAGE_CHECK_TOKEN__';
if (strlen($token) !== 64 || !hash_equals($token, $_SERVER['HTTP_X_CONTACT_CHECK_TOKEN'] ?? '')) {
    http_response_code(404);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    exit;
}

$directory = dirname(__DIR__, 2);
$probePath = $directory . '/.' . basename(__FILE__, '.php') . '.tmp';
$probe = false;
$created = false;
$operation = 'create';
$ok = false;
try {
    $previousMask = umask(0077);
    try {
        $probe = fopen($probePath, 'x+');
    } finally {
        umask($previousMask);
    }
    if ($probe === false) throw new RuntimeException();
    $created = true;
    $operation = 'lock';
    if (!flock($probe, LOCK_EX | LOCK_NB)) throw new RuntimeException();
    $operation = 'write';
    if (fwrite($probe, 'ready') !== 5 || !fflush($probe)) throw new RuntimeException();
    $operation = 'read';
    if (!rewind($probe) || stream_get_contents($probe) !== 'ready') throw new RuntimeException();

    // Проверяем также оставшийся после прежних публикаций файл, не меняя его данные.
    $storagePath = $directory . '/.medved-contact-rate-limit.json';
    $operation = 'existing_storage';
    if (is_link($storagePath)) throw new RuntimeException();
    if (file_exists($storagePath)) {
        $storage = fopen($storagePath, 'r+');
        if ($storage === false) throw new RuntimeException();
        try {
            if (!flock($storage, LOCK_EX | LOCK_NB)) throw new RuntimeException();
            $contents = stream_get_contents($storage, 1048577);
            if ($contents === false || strlen($contents) > 1048576
                || ($contents !== '' && !is_array(json_decode($contents, true)))) {
                throw new RuntimeException();
            }
        } finally {
            fclose($storage);
        }
    }
    $ok = true;
} catch (Throwable $error) {
    error_log('Contact storage check failed: ' . $operation . '.');
} finally {
    if ($probe !== false) fclose($probe);
    if ($created && !unlink($probePath)) {
        $operation = 'cleanup';
        $ok = false;
    }
}

http_response_code($ok ? 200 : 503);
echo json_encode(array('ok' => $ok, 'check' => $ok ? 'passed' : $operation));
