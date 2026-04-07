<?php
// routes/web.php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\WaybillController;
use Illuminate\Support\Facades\Route;

// ========== CSRF ТОКЕН ==========
Route::get('/csrf-token', function() {
    return response()->json(['csrf_token' => csrf_token()]);
});

// ========== SANCTUM (если используешь) ==========
// Если у тебя не установлен Laravel Sanctum, закомментируй эту строку
// Route::get('/sanctum/csrf-cookie', function() {
//     return response()->json(['message' => 'CSRF cookie set']);
// })->middleware('web');

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
    Route::get('/document-types/{code}/fields', [DocumentTypeController::class, 'getFields']);
});

// ========== ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ ДЛЯ ЗАЯВОК ==========
// Добавь, если их нет
Route::get('/applications', [DocumentController::class, 'index']); // или создай отдельный контроллер
Route::post('/waybill/from-application', [WaybillController::class, 'store']);
