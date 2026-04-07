<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $login = $request->input('login');
        $password = $request->input('password');

        $user = DB::table('users')
            ->where('login', $login)
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Неверный логин'], 401);
        }

        if ($user->password !== $password) {
            return response()->json(['error' => 'Неверный пароль'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'login' => $user->login,
            'fullName' => $user->last_name . ' ' . $user->first_name,
            'role' => $user->role_id == 1 ? 'admin' : 'user',
            'token' => base64_encode($user->id . '_' . time())
        ]);
    }

    public function logout()
    {
        return response()->json(['message' => 'Выход выполнен']);
    }
}
