<?php
// routes/web.php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\WaybillController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;

// ========== УДАЛИТЕ ЭТОТ БЛОК - ОН НЕ НУЖЕН ==========
// header('Access-Control-Allow-Origin: http://localhost:1420');
// header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN, X-XSRF-TOKEN');
// header('Access-Control-Allow-Credentials: true');
// ====================================================

// ========== CSRF ТОКЕН ==========
Route::get('/csrf-token', function() {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Публичные маршруты
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Тестовые маршруты
Route::get('/temp', [App\Http\Controllers\TempController::class, 'index']);
Route::post('/temp', [App\Http\Controllers\TempController::class, 'store']);
Route::get('/test', function () {
    return response()->json(['message' => 'Сервер работает']);
});
Route::post('/test-post', function (Illuminate\Http\Request $request) {
    return response()->json(['received' => $request->all()]);
});

// API маршруты (защищены)
Route::middleware(['web'])->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('groups', GroupController::class);
    Route::resource('documents', DocumentController::class);
    Route::post('/documents/{id}/print', [DocumentController::class, 'printDocument']);
    Route::get('/document-types', [DocumentTypeController::class, 'index']);
    Route::get('/document-types/{code}/fields', [DocumentTypeController::class, 'getFields']);
    Route::post('/waybill', [WaybillController::class, 'store']);
    Route::post('/waybill/{id}/save', [WaybillController::class, 'save']);
    Route::post('/waybill/{id}/print', [WaybillController::class, 'printWaybill']);
});

// ========== НОВЫЕ МАРШРУТЫ ДЛЯ АВТОМАТИЧЕСКИХ ШАБЛОНОВ ==========
Route::get('/templates/applications', [TemplateController::class, 'getApplications']);
Route::get('/templates/waybills', [TemplateController::class, 'getWaybills']);
Route::get('/templates/scan', [TemplateController::class, 'scanTemplates']);

// ========== ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ ==========
Route::get('/applications', [DocumentController::class, 'index']);
Route::post('/waybill/from-application', [WaybillController::class, 'store']);
Route::get('/waybill/config', [App\Http\Controllers\WaybillConfigController::class, 'getConfig']);
Route::post('/waybill/save', [WaybillController::class, 'store']);
Route::get('/waybill/{id}/print', [WaybillController::class, 'printWaybill']);
