<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\File;

class WaybillConfigController extends Controller
{
    /**
     * Получить конфигурацию полей и HTML-шаблон для накладной
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConfig(Request $request)
    {
        $option = $request->input('option'); // 'no_request', 'gu12', 'gu13'
        $type = $request->input('type');     // '90', '94'
        $form = $request->input('form');     // 'wagon', 'group', 'container', 'container_set'

        // Определяем, какой HTML-шаблон использовать
        $templateFile = $this->getTemplateFile($form);

        // Загружаем содержимое шаблона
        $templatePath = resource_path("views/templates/{$templateFile}");
        if (!File::exists($templatePath)) {
            return response()->json(['error' => 'Шаблон не найден'], 404);
        }
        $htmlTemplate = File::get($templatePath);

        // Генерируем конфигурацию полей в зависимости от выбранных параметров
        $fieldsConfig = $this->generateFieldsConfig($option, $type, $form);

        return response()->json([
            'fields_config' => $fieldsConfig,
            'html_template' => $htmlTemplate,
        ]);
    }

    /**
     * Вернуть имя файла шаблона на основе формы накладной
     */
    private function getTemplateFile($form)
    {
        $map = [
            'wagon'         => 'waybill_wagon.html',
            'group'         => 'waybill_group.html',
            'container'     => 'waybill_container.html',
            'container_set' => 'waybill_container_set.html',
        ];
        return $map[$form] ?? 'waybill.html';
    }

    /**
     * Сгенерировать массив полей для динамической формы
     */
    private function generateFieldsConfig($option, $type, $form)
    {
        // Базовые поля, общие для всех накладных
        $fields = [
            ['key' => 'date', 'label' => 'Дата оформления', 'type' => 'date', 'required' => true],
            ['key' => 'sender_name', 'label' => 'Грузоотправитель', 'type' => 'text', 'required' => true],
            ['key' => 'sender_okpo', 'label' => 'Код ОКПО отправителя', 'type' => 'text', 'required' => true],
            ['key' => 'receiver_name', 'label' => 'Грузополучатель', 'type' => 'text', 'required' => true],
            ['key' => 'receiver_okpo', 'label' => 'Код ОКПО получателя', 'type' => 'text', 'required' => true],
            ['key' => 'departure_station', 'label' => 'Станция отправления', 'type' => 'text', 'required' => true],
            ['key' => 'departure_station_code', 'label' => 'Код станции отправления', 'type' => 'text', 'required' => true],
            ['key' => 'arrival_station', 'label' => 'Станция назначения', 'type' => 'text', 'required' => true],
            ['key' => 'arrival_station_code', 'label' => 'Код станции назначения', 'type' => 'text', 'required' => true],
            ['key' => 'cargo_name', 'label' => 'Наименование груза', 'type' => 'text', 'required' => true],
            ['key' => 'cargo_code', 'label' => 'Код груза (ЕТСНГ)', 'type' => 'text', 'required' => false],
            ['key' => 'weight', 'label' => 'Вес груза (кг)', 'type' => 'number', 'required' => true],
            ['key' => 'places_count', 'label' => 'Количество мест', 'type' => 'number', 'required' => true],
            ['key' => 'packaging_type', 'label' => 'Род упаковки', 'type' => 'text', 'required' => false],
            ['key' => 'payer_code', 'label' => 'Код плательщика', 'type' => 'text', 'required' => true],
            ['key' => 'payment_amount', 'label' => 'Сумма провозной платы (руб.)', 'type' => 'number', 'required' => true],
            ['key' => 'contract_number', 'label' => 'Номер договора', 'type' => 'text', 'required' => false],
            ['key' => 'signature_sender', 'label' => 'Подпись отправителя', 'type' => 'text', 'required' => false],
            ['key' => 'signature_receiver', 'label' => 'Подпись перевозчика', 'type' => 'text', 'required' => false],
        ];

        // Добавляем поля в зависимости от формы накладной
        if ($form === 'wagon') {
            $fields[] = ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'wagon_type', 'label' => 'Род вагона', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'load_capacity', 'label' => 'Грузоподъемность (т)', 'type' => 'number', 'required' => true];
        } elseif ($form === 'group') {
            $fields[] = ['key' => 'wagon_count', 'label' => 'Количество вагонов', 'type' => 'number', 'required' => true];
            $fields[] = ['key' => 'wagon_numbers', 'label' => 'Номера вагонов', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'total_weight', 'label' => 'Общий вес груза (кг)', 'type' => 'number', 'required' => true];
        } elseif ($form === 'container') {
            $fields[] = ['key' => 'container_number', 'label' => 'Номер контейнера', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'container_type', 'label' => 'Тип контейнера', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'container_tare', 'label' => 'Тара контейнера (кг)', 'type' => 'number', 'required' => false];
            $fields[] = ['key' => 'container_capacity', 'label' => 'Грузоподъемность (кг)', 'type' => 'number', 'required' => false];
        } elseif ($form === 'container_set') {
            $fields[] = ['key' => 'wagon_number', 'label' => 'Номер вагона', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'wagon_type', 'label' => 'Род вагона', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'container_count', 'label' => 'Количество контейнеров', 'type' => 'number', 'required' => true];
            $fields[] = ['key' => 'container_numbers', 'label' => 'Номера контейнеров', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'container_type', 'label' => 'Тип контейнеров', 'type' => 'text', 'required' => true];
        }

        // Если вариант оформления "по заявке ГУ-12" – добавляем поля заявки
        if ($option === 'gu12') {
            $fields[] = ['key' => 'application_number', 'label' => 'Номер заявки ГУ-12', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'agreement_date', 'label' => 'Дата согласования заявки', 'type' => 'date', 'required' => true];
        } elseif ($option === 'gu13') {
            $fields[] = ['key' => 'order_number', 'label' => 'Номер распоряжения ГУ-13', 'type' => 'text', 'required' => true];
            $fields[] = ['key' => 'order_date', 'label' => 'Дата распоряжения', 'type' => 'date', 'required' => true];
        }

        // Для типа накладной 90 или 94 (можно добавить специфические поля, если нужно)
        // Пока просто сохраняем тип в метаданные, но не добавляем отдельные поля.
        // Если нужны дополнительные поля для конкретного типа – добавим.

        return $fields;
    }
}
