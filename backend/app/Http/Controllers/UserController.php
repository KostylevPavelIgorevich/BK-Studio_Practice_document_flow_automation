<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;  // ← добавлено

class UserController extends Controller
{
    public function index()
    {
        $users = DB::table('users')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'login' => 'required|string|max:255|unique:users,login',
            'password' => 'required|string|min:4',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'group_id' => 'nullable|integer|exists:groups,id',
        ], [
            'login.unique' => 'Пользователь с таким логином уже существует',
            'login.required' => 'Логин обязателен',
            'password.required' => 'Пароль обязателен',
            'password.min' => 'Пароль должен содержать не менее 4 символов',
            'last_name.required' => 'Фамилия обязательна',
            'first_name.required' => 'Имя обязательно',
        ]);

        try {
            $data = $request->all();
            $groupId = isset($data['group_id']) && $data['group_id'] !== null && $data['group_id'] !== ''
                ? (int) $data['group_id']
                : null;

            $userId = DB::table('users')->insertGetId([
                'login' => $data['login'],
                'password' => Hash::make($data['password']),
                'last_name' => $data['last_name'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? '',
                'role_id' => 2,
                'group_id' => $groupId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'id' => $userId,
                'message' => 'User created'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {
            $updateData = [
                'login' => $request->login,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'role_id' => $request->role_id,
                'group_id' => $request->group_id,
                'updated_at' => now()
            ];

            // Если передан пароль – хешируем и обновляем
            if ($request->filled('password') && !empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
            }

            DB::table('users')->where('id', $id)->update($updateData);

            return response()->json(['id' => $id, 'message' => 'Пользователь обновлён']);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::table('users')->where('id', $id)->delete();
        return response()->json(null, 204);
    }
}
