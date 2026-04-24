<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypesSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = [
            // ... (существующие записи, которые у вас уже есть) ...

            // НОВЫЕ записи для ваших файлов
            [
                'code' => 'gu27_dt',
                'name' => 'Пересылочная накладная ГУ-27 дт',
                'html_template' => 'gu27_dt.html',
                'fields_config' => null,
            ],
            [
                'code' => 'keu4_vc',
                'name' => 'Приемо-сдаточный акт КЭУ-4 ВЦ',
                'html_template' => 'keu4_vc.html',
                'fields_config' => null,
            ],
            [
                'code' => 'keu4_vc_1',
                'name' => 'Приемо-сдаточный акт КЭУ-4 ВЦ (1)',
                'html_template' => 'keu4_vc_1.html',
                'fields_config' => null,
            ],
        ];

        foreach ($documentTypes as $type) {
            DB::table('document_types')->updateOrInsert(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'html_template' => $type['html_template'],
                    'fields_config' => $type['fields_config'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
