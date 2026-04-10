<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypesSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = [
            // ========== СУЩЕСТВУЮЩИЕ ТИПЫ ==========
            [
                'code' => 'gu12',
                'name' => 'Заявка на перевозку грузов ГУ-12',
                'html_template' => 'gu12.html',
                'fields_config' => json_encode([
                    ['key' => 'bid_number', 'label' => 'Номер заявки', 'type' => 'text', 'required' => true],
                    ['key' => 'registration_date', 'label' => 'Дата регистрации', 'type' => 'date', 'required' => true],
                    ['key' => 'agreement_date', 'label' => 'Дата согласования', 'type' => 'date', 'required' => true],
                    ['key' => 'carrier_name', 'label' => 'Перевозчик', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'destination_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес груза (тонн)', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_count', 'label' => 'Количество вагонов', 'type' => 'number', 'required' => true],
                    ['key' => 'sender_signature', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
                    ['key' => 'carrier_signature', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
                ]),
            ],
            [
                'code' => 'gu27',
                'name' => 'Требование на перемещение порожнего вагона ГУ-27',
                'html_template' => 'gu27.html',
                'fields_config' => json_encode([
                    ['key' => 'document_number', 'label' => 'Номер документа', 'type' => 'text', 'required' => true],
                    ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true],
                    ['key' => 'wagon_type', 'label' => 'Род вагона', 'type' => 'text', 'required' => true],
                    ['key' => 'load_capacity', 'label' => 'Грузоподъемность (тонн)', 'type' => 'number', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция прибытия', 'type' => 'text', 'required' => true],
                    ['key' => 'distance', 'label' => 'Расстояние (км)', 'type' => 'number', 'required' => true],
                ]),
            ],
            [
                'code' => 'gu2b',
                'name' => 'Уведомление о передаче вагонов ГУ-2б',
                'html_template' => 'gu2b.html',
                'fields_config' => json_encode([
                    ['key' => 'notification_number', 'label' => 'Номер уведомления', 'type' => 'text', 'required' => true],
                    ['key' => 'notification_type', 'label' => 'Тип уведомления', 'type' => 'text', 'required' => true],
                    ['key' => 'station_name', 'label' => 'Станция', 'type' => 'text', 'required' => true],
                    ['key' => 'road_name', 'label' => 'Дорога', 'type' => 'text', 'required' => true],
                    ['key' => 'hour', 'label' => 'Часы', 'type' => 'number', 'required' => true],
                    ['key' => 'minutes', 'label' => 'Минуты', 'type' => 'number', 'required' => true],
                    ['key' => 'day', 'label' => 'Число', 'type' => 'number', 'required' => true],
                    ['key' => 'month', 'label' => 'Месяц', 'type' => 'text', 'required' => true],
                    ['key' => 'client_name', 'label' => 'Наименование клиента', 'type' => 'text', 'required' => true],
                    ['key' => 'transfer_place', 'label' => 'Место передачи', 'type' => 'text', 'required' => true],
                    ['key' => 'locomotive', 'label' => 'Локомотив', 'type' => 'text', 'required' => true],
                    ['key' => 'sequence_number', 'label' => 'Порядковый номер', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true],
                    ['key' => 'container_number', 'label' => 'Номер контейнера', 'type' => 'text', 'required' => false],
                    ['key' => 'seal_type', 'label' => 'Тип ЗПУ', 'type' => 'text', 'required' => false],
                    ['key' => 'seal_mark', 'label' => 'Контрольный знак', 'type' => 'text', 'required' => false],
                    ['key' => 'operation', 'label' => 'Операция', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'notes', 'label' => 'Примечание', 'type' => 'textarea', 'required' => false],
                    ['key' => 'client_agent', 'label' => 'Представитель клиента', 'type' => 'text', 'required' => true],
                ]),
            ],
            [
                'code' => 'gu36',
                'name' => 'Уведомление о прибытии ГУ-36',
                'html_template' => 'gu36.html',
                'fields_config' => json_encode([
                    ['key' => 'cargo_type', 'label' => 'Тип груза', 'type' => 'text', 'required' => true],
                    ['key' => 'notification_number', 'label' => 'Номер уведомления', 'type' => 'text', 'required' => true],
                    ['key' => 'receiver', 'label' => 'Получатель', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_date', 'label' => 'Дата прибытия', 'type' => 'date', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция прибытия', 'type' => 'text', 'required' => true],
                    ['key' => 'train_number', 'label' => 'Номер поезда', 'type' => 'text', 'required' => true],
                    ['key' => 'waybill_number', 'label' => 'Номер квитанции', 'type' => 'text', 'required' => true],
                    ['key' => 'receipt_date', 'label' => 'Дата квитанции', 'type' => 'date', 'required' => true],
                    ['key' => 'sender', 'label' => 'Отправитель', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'storage_hours', 'label' => 'Время хранения', 'type' => 'text', 'required' => true],
                    ['key' => 'storage_address', 'label' => 'Адрес хранения', 'type' => 'text', 'required' => true],
                    ['key' => 'agent_position', 'label' => 'Должность представителя', 'type' => 'text', 'required' => true],
                    ['key' => 'agent_name', 'label' => 'ФИО представителя', 'type' => 'text', 'required' => true],
                    ['key' => 'notification_datetime', 'label' => 'Дата и время уведомления', 'type' => 'datetime-local', 'required' => true],
                ]),
            ],
            [
                'code' => 'lu59',
                'name' => 'Ярлык на прием багажа ЛУ-59',
                'html_template' => 'lu59.html',
                'fields_config' => json_encode([
                    ['key' => 'tag_number', 'label' => 'Номер ярлыка', 'type' => 'text', 'required' => true],
                    ['key' => 'receive_date', 'label' => 'Дата приема', 'type' => 'date', 'required' => true],
                    ['key' => 'train_number', 'label' => 'Номер поезда', 'type' => 'text', 'required' => true],
                    ['key' => 'ticket_number', 'label' => 'Номер билета', 'type' => 'text', 'required' => true],
                    ['key' => 'destination', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'places_count', 'label' => 'Количество мест', 'type' => 'number', 'required' => true],
                    ['key' => 'package_type', 'label' => 'Род упаковки', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес', 'type' => 'number', 'required' => true],
                    ['key' => 'declared_value', 'label' => 'Сумма объявленной ценности', 'type' => 'number', 'required' => false],
                    ['key' => 'sender', 'label' => 'Отправитель', 'type' => 'text', 'required' => false],
                    ['key' => 'receiver', 'label' => 'Получатель', 'type' => 'text', 'required' => false],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => false],
                    ['key' => 'receiving_agent', 'label' => 'Приемосдатчик', 'type' => 'text', 'required' => true],
                ]),
            ],
            [
                'code' => 'waybill',
                'name' => 'Накладная на перевозку груза (базовая)',
                'html_template' => 'waybill.html',
                'fields_config' => null,
            ],

            // ========== НОВЫЕ ТИПЫ НАКЛАДНЫХ ==========
            [
                'code' => 'waybill_wagon',
                'name' => 'Накладная на перевозку груза (повагонная)',
                'html_template' => 'waybill_wagon.html',
                'fields_config' => json_encode([
                    ['key' => 'date', 'label' => 'Дата оформления', 'type' => 'date', 'required' => true],
                    ['key' => 'sender_name', 'label' => 'Грузоотправитель', 'type' => 'text', 'required' => true],
                    ['key' => 'receiver_name', 'label' => 'Грузополучатель', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес (кг)', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true],
                    ['key' => 'wagon_type', 'label' => 'Род вагона', 'type' => 'text', 'required' => false],
                    ['key' => 'signature_sender', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
                    ['key' => 'signature_receiver', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
                ]),
            ],
            [
                'code' => 'waybill_group',
                'name' => 'Накладная на перевозку груза (групповая)',
                'html_template' => 'waybill_group.html',
                'fields_config' => json_encode([
                    ['key' => 'date', 'label' => 'Дата оформления', 'type' => 'date', 'required' => true],
                    ['key' => 'sender_name', 'label' => 'Грузоотправитель', 'type' => 'text', 'required' => true],
                    ['key' => 'receiver_name', 'label' => 'Грузополучатель', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес (кг)', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_count', 'label' => 'Количество вагонов', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_numbers', 'label' => 'Номера вагонов', 'type' => 'text', 'required' => true],
                    ['key' => 'total_weight', 'label' => 'Общий вес (кг)', 'type' => 'number', 'required' => true],
                    ['key' => 'signature_sender', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
                    ['key' => 'signature_receiver', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
                ]),
            ],
            [
                'code' => 'waybill_container',
                'name' => 'Накладная на перевозку груза (контейнерная)',
                'html_template' => 'waybill_container.html',
                'fields_config' => json_encode([
                    ['key' => 'date', 'label' => 'Дата оформления', 'type' => 'date', 'required' => true],
                    ['key' => 'sender_name', 'label' => 'Грузоотправитель', 'type' => 'text', 'required' => true],
                    ['key' => 'receiver_name', 'label' => 'Грузополучатель', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес (кг)', 'type' => 'number', 'required' => true],
                    ['key' => 'container_number', 'label' => 'Номер контейнера', 'type' => 'text', 'required' => true],
                    ['key' => 'container_type', 'label' => 'Тип контейнера', 'type' => 'text', 'required' => true],
                    ['key' => 'signature_sender', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
                    ['key' => 'signature_receiver', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
                ]),
            ],
            [
                'code' => 'waybill_container_set',
                'name' => 'Накладная на перевозку груза (контейнерная комплектом)',
                'html_template' => 'waybill_container_set.html',
                'fields_config' => json_encode([
                    ['key' => 'date', 'label' => 'Дата оформления', 'type' => 'date', 'required' => true],
                    ['key' => 'sender_name', 'label' => 'Грузоотправитель', 'type' => 'text', 'required' => true],
                    ['key' => 'receiver_name', 'label' => 'Грузополучатель', 'type' => 'text', 'required' => true],
                    ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
                    ['key' => 'arrival_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
                    ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
                    ['key' => 'weight', 'label' => 'Вес (кг)', 'type' => 'number', 'required' => true],
                    ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true],
                    ['key' => 'container_count', 'label' => 'Количество контейнеров', 'type' => 'number', 'required' => true],
                    ['key' => 'container_numbers', 'label' => 'Номера контейнеров', 'type' => 'text', 'required' => true],
                    ['key' => 'signature_sender', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
                    ['key' => 'signature_receiver', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
                ]),
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
