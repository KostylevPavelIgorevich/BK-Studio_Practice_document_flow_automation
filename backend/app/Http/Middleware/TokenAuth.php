<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Ищем токен в заголовке X-Auth-Token или Authorization: Bearer
        $token = $request->header('X-Auth-Token') ?? $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Декодируем base64 (формат: "id_время")
        $decoded = base64_decode($token);
        if (!$decoded || !str_contains($decoded, '_')) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        [$userId, $timestamp] = explode('_', $decoded, 2);
        if (!is_numeric($userId)) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        // Проверяем, существует ли пользователь
        $user = DB::table('users')->where('id', $userId)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 401);
        }

        // (Опционально) проверяем, что токен не старше 24 часов
        if ($timestamp < time() - 86400) {
            return response()->json(['error' => 'Token expired'], 401);
        }

        // Подкладываем user_id в запрос для удобства в контроллерах
        $request->merge(['auth_user_id' => $userId]);

        return $next($request);
    }
}
