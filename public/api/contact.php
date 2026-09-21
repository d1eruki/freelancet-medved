<?php

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
if (strpos($contentType, 'application/json') !== 0) {
    respond(415, array('message' => 'Неверный формат запроса.'));
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 16384) {
    respond(400, array('message' => 'Неверный размер запроса.'));
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
    respond(400, array('message' => 'Не удалось прочитать данные формы.'));
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

if ($phone === '' || text_length($phone) > 60 || !preg_match('/^[0-9+()\-\s.]+$/', $phone)) {
    respond(422, array('message' => 'Укажите корректный телефон.'));
}

if ($email !== '' && (text_length($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    respond(422, array('message' => 'Укажите корректную электронную почту.'));
}

if (text_length($message) > 4000) {
    respond(422, array('message' => 'Сообщение слишком длинное.'));
}

if (!$consent) {
    respond(422, array('message' => 'Необходимо согласие на обработку персональных данных.'));
}

session_start();
$now = time();
$lastSubmission = isset($_SESSION['contact_form_submitted_at']) ? (int) $_SESSION['contact_form_submitted_at'] : 0;
if ($lastSubmission > 0 && $now - $lastSubmission < 10) {
    respond(429, array('message' => 'Подождите немного перед повторной отправкой.'));
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
    respond(500, array('message' => 'Не удалось отправить сообщение. Попробуйте ещё раз.'));
}

$_SESSION['contact_form_submitted_at'] = $now;
respond(200, array('ok' => true));
