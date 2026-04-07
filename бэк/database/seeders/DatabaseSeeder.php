<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем таблицы
        DB::table('users')->delete();
        DB::table('groups')->delete();
        DB::table('roles')->delete();
        DB::table('document_types')->delete();  // Добавить очистку типов документов

        // Сбрасываем счётчики
        DB::statement("DELETE FROM sqlite_sequence WHERE name='roles'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='groups'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='users'");
        DB::statement("DELETE FROM sqlite_sequence WHERE name='document_types'");  // Добавить

        // Создаём роли
        DB::table('roles')->insert([
            ['name' => 'admin', 'description' => 'Администратор', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'user', 'description' => 'Пользователь', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Получаем ID роли admin
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id');

        // Создаём только АДМИНА (без группы, админ создаст группы сам)
        DB::table('users')->insert([
            'login' => 'admin',
            'password' => 'admin123',
            'last_name' => 'Администратор',
            'first_name' => 'Системы',
            'middle_name' => '',
            'role_id' => $adminRoleId,
            'group_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ВЫЗЫВАЕМ СИДЕР ДЛЯ ТИПОВ ДОКУМЕНТОВ
        $this->call(DocumentTypesSeeder::class);
    }
}
