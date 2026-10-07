<?php

// Диагностика остаётся в журнале PHP и не нарушает формат JSON-ответа.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function text_length($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, array('message' => 'Метод не поддерживается.'));
}

$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (strtolower(trim(explode(';', $contentType)[0])) !== 'application/json') {
    respond(415, array('message' => 'Неверный формат запроса.'));
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 16384) {
    respond(400, array('message' => 'Неверный размер запроса.'));
}

$decoded = json_decode($rawBody);
if (!is_object($decoded)) {
    respond(400, array('message' => 'Не удалось прочитать данные формы.'));
}
$data = get_object_vars($decoded);

foreach (array('name', 'phone', 'email', 'message', 'website') as $field) {
    if (array_key_exists($field, $data) && !is_string($data[$field])) {
        respond(422, array('message' => 'Поля формы должны содержать текст.'));
    }
}

$name = isset($data['name']) ? trim((string) $data['name']) : '';
$phone = isset($data['phone']) ? trim((string) $data['phone']) : '';
$email = isset($data['email']) ? trim((string) $data['email']) : '';
$message = isset($data['message']) ? trim((string) $data['message']) : '';
$website = isset($data['website']) ? trim((string) $data['website']) : '';
$consent = isset($data['consent']) && $data['consent'] === true;

if ($website !== '') {
    respond(200, array('ok' => true));
}

if ($name === '' || text_length($name) > 120) {
    respond(422, array('message' => 'Укажите ваше имя.'));
}

if (text_length($phone) > 60 || !preg_match('/^\+?[0-9() .-]+$/D', $phone)) {
    respond(422, array('message' => 'Укажите корректный телефон.'));
}
$phone = preg_replace('/[+() .-]/', '', $phone);
if (!preg_match('/^[78][0-9]{10}$/D', $phone)) {
    respond(422, array('message' => 'Укажите корректный телефон.'));
}
$phone = '7' . substr($phone, 1);

if ($email !== '' && (text_length($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    respond(422, array('message' => 'Укажите корректную электронную почту.'));
}

if (text_length($message) > 4000) {
    respond(422, array('message' => 'Сообщение слишком длинное.'));
}

if (!$consent) {
    respond(422, array('message' => 'Необходимо согласие на обработку персональных данных.'));
}

// Один лимит для IP независимо от cookies. Файл находится вне публичного каталога;
// храним только хеши IP и удаляем истёкшие записи при следующем обращении.
$address = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
if (!filter_var($address, FILTER_VALIDATE_IP)) {
    respond(503, array('message' => 'Отправка временно недоступна. Попробуйте позже.'));
}
$rateLimitPath = dirname(__DIR__, 2) . '/.medved-contact-rate-limit.json';
$previousMask = umask(0077);
$rateLimitFile = fopen($rateLimitPath, 'c+');
umask($previousMask);
if ($rateLimitFile === false || !flock($rateLimitFile, LOCK_EX)) {
    if ($rateLimitFile !== false) fclose($rateLimitFile);
    respond(503, array('message' => 'Отправка временно недоступна. Попробуйте позже.'));
}
$storedLimits = stream_get_contents($rateLimitFile);
$submissions = $storedLimits === '' ? array() : json_decode($storedLimits, true);
if (!is_array($submissions)) {
    fclose($rateLimitFile);
    respond(503, array('message' => 'Отправка временно недоступна. Попробуйте позже.'));
}
$now = time();
foreach ($submissions as $key => $submittedAt) {
    if (!is_int($submittedAt) || $now - $submittedAt >= 10) unset($submissions[$key]);
}
$addressKey = hash('sha256', $address);
if (isset($submissions[$addressKey])) {
    $retryAfter = max(1, 10 - ($now - $submissions[$addressKey]));
    fclose($rateLimitFile);
    header('Retry-After: ' . $retryAfter);
    respond(429, array('message' => 'Подождите немного перед повторной отправкой.'));
}
// Резервируем попытку до mail(): параллельные запросы и ошибки почты тоже ограничены.
$submissions[$addressKey] = $now;
$encodedLimits = json_encode($submissions);
$saved = rewind($rateLimitFile) && ftruncate($rateLimitFile, 0)
    && fwrite($rateLimitFile, $encodedLimits) === strlen($encodedLimits) && fflush($rateLimitFile);
fclose($rateLimitFile);
if (!$saved) {
    respond(503, array('message' => 'Отправка временно недоступна. Попробуйте позже.'));
}

$recipient = 'info@medved.beer';
$subject = '=?UTF-8?B?' . base64_encode('Новая заявка с сайта medved.beer') . '?=';
$body = "Имя: " . $name . "\n"
    . "Телефон: " . $phone . "\n"
    . "Электронная почта: " . ($email !== '' ? $email : 'не указана') . "\n\n"
    . "Сообщение:\n" . ($message !== '' ? $message : 'не указано') . "\n";
$senderName = '=?UTF-8?B?' . base64_encode('Сайт МЁДВЕДЬ') . '?=';
$headers = array(
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $senderName . ' <info@medved.beer>',
);

if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

if (!mail($recipient, $subject, $body, implode("\r\n", $headers))) {
    error_log('Contact API: mail() failed to accept the message for delivery.');
    respond(500, array('message' => 'Не удалось отправить сообщение. Попробуйте ещё раз.'));
}

respond(200, array('ok' => true));
