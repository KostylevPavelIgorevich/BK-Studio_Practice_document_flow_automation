<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\File;

class TemplateController extends Controller
{
    public function scanTemplates()
    {
        $templatesPath = public_path('templates');

        if (!File::exists($templatesPath)) {
            return response()->json([
                'success' => false,
                'error' => 'Папка templates не найдена',
                'path' => $templatesPath
            ], 404);
        }

        $files = File::files($templatesPath);
        $templates = [];

        foreach ($files as $file) {
            if ($file->getExtension() !== 'html') {
                continue;
            }

            $filename = $file->getFilename();
            $content = File::get($file->getRealPath());

            // Определяем тип
            $type = 'application';
            if (str_contains($filename, 'waybill')) {
                $type = 'waybill';
            }

            // Извлекаем название из HTML
            $templateName = $this->extractTemplateName($content, $filename);

            // Извлекаем поля с автоматической валидацией
            $fields = $this->extractFieldsWithAutoValidation($content);

            $templates[] = [
                'filename' => $filename,
                'name' => $templateName,
                'type' => $type,
                'fields' => $fields,
                'html_content' => $content,
            ];
        }

        return response()->json([
            'success' => true,
            'templates' => $templates,
            'total' => count($templates)
        ]);
    }

    /**
     * Извлекает название шаблона из HTML
     */
    private function extractTemplateName($content, $filename)
    {
        if (preg_match('/<title>([^<]+)<\/title>/', $content, $matches)) {
            $title = trim($matches[1]);
            if (!empty($title) && strlen($title) < 100) {
                return $title;
            }
        }

        if (preg_match('/<h1[^>]*>([^<]+)<\/h1>/', $content, $matches)) {
            $h1 = trim($matches[1]);
            if (!empty($h1) && strlen($h1) < 100) {
                return $h1;
            }
        }

        $name = str_replace(['.html', '_'], ['', ' '], $filename);
        return ucfirst($name);
    }

    /**
     * Извлекает поля с АВТОМАТИЧЕСКОЙ валидацией
     * ВСЕ поля обязательные!
     */
    private function extractFieldsWithAutoValidation($html)
    {
        preg_match_all('/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/', $html, $matches);
        $placeholders = array_unique($matches[1]);

        $fields = [];

        foreach ($placeholders as $placeholder) {
            // Исключаем служебные поля
            if (in_array($placeholder, ['option_name', 'waybill_type_name', 'current_date'])) {
                continue;
            }

            // Находим label из HTML
            $label = $this->findLabelForField($placeholder, $html);
            if (!$label) {
                $label = $placeholder;
            }

            // АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ТИПА ВАЛИДАЦИИ
            $validationType = $this->autoDetectValidationType($placeholder);

            $fields[] = [
                'key' => $placeholder,
                'label' => $label,
                'type' => $validationType['inputType'],     // 'text', 'number', 'date'
                'validation' => $validationType['rule'],     // правило валидации
                'required' => true,                          // ВСЕ ПОЛЯ ОБЯЗАТЕЛЬНЫЕ!
            ];
        }

        return $fields;
    }

    /**
     * АВТОМАТИЧЕСКОЕ определение типа валидации по ключу поля
     */
    private function autoDetectValidationType($key)
    {
        $keyLower = strtolower($key);

        // Дата
        if (str_contains($keyLower, 'date')) {
            return [
                'inputType' => 'date',
                'rule' => 'date'
            ];
        }

        // Числа (вес, количество, расстояние, вместимость)
        $numberKeywords = ['weight', 'count', 'quantity', 'number', 'distance', 'capacity', 'load', 'amount', 'price', 'sum'];
        foreach ($numberKeywords as $keyword) {
            if (str_contains($keyLower, $keyword)) {
                return [
                    'inputType' => 'number',
                    'rule' => 'number|min:1|max:100000'
                ];
            }
        }

        // Email
        if (str_contains($keyLower, 'email')) {
            return [
                'inputType' => 'email',
                'rule' => 'email'
            ];
        }

        // Телефон
        if (str_contains($keyLower, 'phone') || str_contains($keyLower, 'tel')) {
            return [
                'inputType' => 'tel',
                'rule' => 'phone'
            ];
        }

        // Текст по умолчанию
        return [
            'inputType' => 'text',
            'rule' => 'required|max:255'
        ];
    }

    /**
     * Находит подпись поля в HTML
     */
    private function findLabelForField($placeholder, $html)
    {
        $patterns = [
            '/<div[^>]*class="[^"]*field-label[^"]*"[^>]*>([^<]+)<\/div>\s*<div[^>]*class="[^"]*field-value[^"]*"[^>]*>{{\s*' . $placeholder . '\s*}}/s',
            '/<label[^>]*>([^<]*){{\s*' . $placeholder . '\s*}}<\/label>/s',
            '/<th[^>]*>([^<]+)<\/th>\s*<td[^>]*>{{\s*' . $placeholder . '\s*}}/s',
            '/([А-Яа-яA-Za-z0-9\s\-№#]+)[\s:]*{{\s*' . $placeholder . '\s*}}/u',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                $label = trim($matches[1]);
                $label = rtrim($label, ':');
                $label = trim($label);

                if (!empty($label) && strlen($label) < 100) {
                    return $label;
                }
            }
        }

        return null;
    }

    public function getApplications()
    {
        $response = $this->scanTemplates();
        $data = $response->getData(true);

        if (!$data['success']) {
            return $response;
        }

        $applications = array_filter($data['templates'], function($template) {
            return $template['type'] === 'application';
        });

        return response()->json([
            'success' => true,
            'applications' => array_values($applications),
            'total' => count($applications)
        ]);
    }

    public function getWaybills()
    {
        $response = $this->scanTemplates();
        $data = $response->getData(true);

        if (!$data['success']) {
            return $response;
        }

        $waybills = array_filter($data['templates'], function($template) {
            return $template['type'] === 'waybill';
        });

        return response()->json([
            'success' => true,
            'waybills' => array_values($waybills),
            'total' => count($waybills)
        ]);
    }
}
