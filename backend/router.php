<?php
// router.php - полностью автоматический

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$publicDir = __DIR__ . '/public';
$filePath = $publicDir . $uri;

// Статические файлы (CSS, JS, изображения, HTML)
if ($uri !== '/' && is_file($filePath)) {
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mime = [
        'css' => 'text/css',
        'js'  => 'application/javascript',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg'=> 'image/jpeg',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'html'=> 'text/html',
    ];
    if (isset($mime[$ext])) {
        header('Content-Type: ' . $mime[$ext]);
    }
    readfile($filePath);
    exit;
}

// ВСЕ остальные запросы – в Laravel
require_once __DIR__ . '/public/index.php';
