<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$publicDir = __DIR__ . '/public';
$filePath = $publicDir . $uri;

// Статические файлы (CSS, JS, изображения)
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

// API-маршруты (перенаправляем в Laravel)
$api_prefixes = ['/api', '/login', '/logout', '/templates', '/documents', '/users', '/groups', '/csrf-token', '/temp', '/test', '/applications', '/waybill'];
foreach ($api_prefixes as $prefix) {
    if (strpos($uri, $prefix) === 0) {
        require_once __DIR__ . '/public/index.php';
        exit;
    }
}

// Все остальные маршруты (React Router) – отдаём index.html
readfile($publicDir . '/index.html');
