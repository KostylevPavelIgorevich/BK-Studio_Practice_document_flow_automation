<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class HashPasswords extends Command
{
    protected $signature = 'passwords:hash';
    protected $description = 'Хеширует пароли всех пользователей';

    public function handle()
    {
        $users = DB::table('users')->get();
        $count = 0;

        foreach ($users as $user) {
            if (!str_starts_with($user->password, '$2y$')) {
                DB::table('users')->where('id', $user->id)->update([
                    'password' => Hash::make($user->password)
                ]);
                $this->info("Обновлён: {$user->login}");
                $count++;
            }
        }

        $this->info("Готово! Обновлено пользователей: {$count}");
    }
}
