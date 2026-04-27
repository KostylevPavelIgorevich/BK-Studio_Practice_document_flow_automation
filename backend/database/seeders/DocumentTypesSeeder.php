<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DocumentTypesSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем таблицу document_types
        DB::table('document_types')->delete();

        // НЕ ДОБАВЛЯЕМ НИ ОДНОГО ТИПА ДОКУМЕНТОВ!
        // Они будут создаваться автоматически при первом запросе к /templates-list
    }
}
