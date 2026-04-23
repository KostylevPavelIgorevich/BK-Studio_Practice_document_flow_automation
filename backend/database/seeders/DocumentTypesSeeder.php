<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypesSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = [
            // Заявки и уведомления
            [
                'code' => 'gu12',
                'name' => 'Заявка на перевозку грузов ГУ-12',
                'html_template' => 'gu12.html',
                'fields_config' => null,
            ],
            [
                'code' => 'gu27',
                'name' => 'Пересылочная накладная ГУ-27 дт',
                'html_template' => 'gu27_new.html',   // убедитесь, что файл существует
                'fields_config' => null,
            ],
            [
                'code' => 'gu2b',
                'name' => 'Уведомление о передаче вагонов ГУ-2б',
                'html_template' => 'gu2b.html',
                'fields_config' => null,
            ],
            [
                'code' => 'gu36',
                'name' => 'Уведомление о прибытии ГУ-36',
                'html_template' => 'gu36.html',
                'fields_config' => null,
            ],
            [
                'code' => 'lu59',
                'name' => 'Ярлык на прием багажа ЛУ-59',
                'html_template' => 'lu59.html',
                'fields_config' => null,
            ],

            // Накладные (waybill)
            [
                'code' => 'waybill',
                'name' => 'Накладная на перевозку груза (базовая)',
                'html_template' => 'waybill.html',
                'fields_config' => null,
            ],
            [
                'code' => 'waybill_wagon',
                'name' => 'Накладная на перевозку груза (повагонная)',
                'html_template' => 'waybill_wagon.html',
                'fields_config' => null,
            ],
            [
                'code' => 'waybill_group',
                'name' => 'Накладная на перевозку груза (групповая)',
                'html_template' => 'waybill_group.html',
                'fields_config' => null,
            ],
            [
                'code' => 'waybill_container',
                'name' => 'Накладная на перевозку груза (контейнерная)',
                'html_template' => 'waybill_container.html',
                'fields_config' => null,
            ],
            [
                'code' => 'waybill_container_set',
                'name' => 'Накладная на перевозку груза (контейнерная комплектом)',
                'html_template' => 'waybill_container_set.html',
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
