<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        $users = DB::table('users')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        try {
            // Получаем все данные
            $data = $request->all();

            // Убеждаемся что group_id число
            $groupId = isset($data['group_id']) && $data['group_id'] !== null && $data['group_id'] !== ''
                ? (int) $data['group_id']
                : null;

            // Простая вставка
            $userId = DB::table('users')->insertGetId([
                'login' => $data['login'],
                'password' => $data['password'],
                'last_name' => $data['last_name'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? '',
                'role_id' => 2,
                'group_id' => $groupId,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
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
            // Данные для обновления
            $updateData = [
                'login' => $request->login,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'role_id' => $request->role_id,
                'group_id' => $request->group_id,
                'updated_at' => now()
            ];

            // Обновляем пароль ТОЛЬКО если он передан и не пустой
            if ($request->filled('password') && !empty($request->password)) {
                $updateData['password'] = $request->password;
            }
            // Если пароль не передан - оставляем старый (не обновляем поле)

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
