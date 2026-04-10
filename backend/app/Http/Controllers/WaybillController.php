<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WaybillController extends Controller
{
    public function store(Request $request)
    {
        // Находим ID типа документа "Накладная"
        $docType = DB::table('document_types')->where('code', 'waybill')->first();
        if (!$docType) {
            return response()->json(['error' => 'Тип документа не найден'], 400);
        }

        $id = DB::table('documents')->insertGetId([
            'user_id' => $request->user_id,
            'document_type_id' => $docType->id,
            'status' => 'draft',
            'form_data' => json_encode($request->all()), // сохраняем все поля + параметры option, type, form
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id]);
    }

    public function printWaybill($id)
    {
        $document = DB::table('documents')->where('id', $id)->first();
        if (!$document) {
            return response()->json(['error' => 'Документ не найден'], 404);
        }

        $formData = json_decode($document->form_data, true);
        $option = $formData['option'] ?? 'no_request';
        $type = $formData['type'] ?? '90';
        $form = $formData['form'] ?? 'wagon';

        // Определяем шаблон
        $templateFile = $this->getTemplateFile($form);
        $templatePath = resource_path("views/templates/{$templateFile}");
        $htmlTemplate = file_get_contents($templatePath);

        // Заменяем плейсхолдеры {{ key }} на значения
        $html = $this->renderTemplate($htmlTemplate, $formData, $option, $type);

        return response()->json(['html' => $html]);
    }

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

    private function renderTemplate($template, $data, $option, $type)
    {
        // Добавляем служебные поля для отображения в шапке
        $optionNames = [
            'no_request' => 'Без заявки',
            'gu12'       => 'По заявке ГУ-12',
            'gu13'       => 'По распоряжению ГУ-13',
        ];
        $typeNames = [
            '90' => 'Универсальный перевозочный документ (90)',
            '94' => 'Универсальный перевозочный документ (94)',
        ];
        $data['option_name'] = $optionNames[$option] ?? $option;
        $data['waybill_type_name'] = $typeNames[$type] ?? $type;

        // Заменяем {{ key }} на значение
        $html = $template;
        foreach ($data as $key => $value) {
            $html = str_replace('{{ ' . $key . ' }}', e($value), $html);
        }

        // Обрабатываем условные блоки {{#if application_number}} ... {{/if}}
        // Простая реализация: удаляем блок, если условие не выполнено
        $html = preg_replace_callback('/{{#if (\w+)}}(.*?){{\/if}}/s', function($matches) use ($data) {
            $key = $matches[1];
            $content = $matches[2];
            if (!empty($data[$key])) {
                return $content;
            }
            return '';
        }, $html);

        return $html;
    }
}
