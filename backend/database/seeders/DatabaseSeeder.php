<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // добавьте эту строку

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем таблицы
        DB::table('users')->delete();
        DB::table('groups')->delete();
        DB::table('roles')->delete();
        DB::table('document_types')->delete();

        // Сбрасываем счётчики
        DB::statement("DELETE FROM sqlite_sequence WHERE name='roles'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='groups'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='users'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='document_types'");

        // Создаём роли
        DB::table('roles')->insert([
            ['name' => 'admin', 'description' => 'Администратор', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'user', 'description' => 'Пользователь', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Получаем ID ролей
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id');
        $userRoleId = DB::table('roles')->where('name', 'user')->value('id');

        // Создаём администратора (пароль хешируем)
        DB::table('users')->insert([
            'login' => 'admin',
            'password' => Hash::make('admin123'),
            'last_name' => 'Администратор',
            'first_name' => 'Системы',
            'middle_name' => '',
            'role_id' => $adminRoleId,
            'group_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Создаём обычного пользователя (студента)
        DB::table('users')->insert([
            'login' => 'student',
            'password' => Hash::make('student123'),
            'last_name' => 'Уланова',
            'first_name' => 'Анастасия',
            'middle_name' => 'Александровна',
            'role_id' => $userRoleId,
            'group_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Вызываем сидер для типов документов
        $this->call(DocumentTypesSeeder::class);
    }
}
