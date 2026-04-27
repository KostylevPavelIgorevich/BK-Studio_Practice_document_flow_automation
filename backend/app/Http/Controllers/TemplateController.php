<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Stichoza\GoogleTranslate\GoogleTranslate;
class TemplateController extends Controller
{
    private function syncDocumentType($filename, $templateName, $fields)
    {
        $code = pathinfo($filename, PATHINFO_FILENAME);
        $existing = DB::table('document_types')->where('code', $code)->first();
        $data = [
            'name' => $templateName,
            'html_template' => $filename,
            'fields_config' => json_encode($fields),
            'updated_at' => now(),
        ];
        if ($existing) {
            DB::table('document_types')->where('code', $code)->update($data);
            return $existing->id;
        } else {
            $data['code'] = $code;
            $data['created_at'] = now();
            return DB::table('document_types')->insertGetId($data);
        }
    }

    public function scanTemplates()
    {
        $templatesPath = public_path('templates');
        if (!File::exists($templatesPath)) {
            return response()->json(['success' => false, 'error' => 'Папка templates не найдена'], 404);
        }
        $files = File::files($templatesPath);
        $templates = [];
        foreach ($files as $file) {
            if ($file->getExtension() !== 'html') continue;
            $filename = $file->getFilename();
            $content = File::get($file->getRealPath());
            $type = str_contains($filename, 'waybill') ? 'waybill' : 'application';
            $templateName = $this->extractTemplateName($content, $filename);
            $fields = $this->extractFieldsWithAutoValidation($content);
            $documentTypeId = $this->syncDocumentType($filename, $templateName, $fields);
            $templates[] = [
                'id' => $documentTypeId,
                'filename' => $filename,
                'name' => $templateName,
                'type' => $type,
                'fields' => $fields,
                'html_content' => $content,
            ];
        }
        return response()->json(['success' => true, 'templates' => $templates, 'total' => count($templates)]);
    }

    public function getApplications()
    {
        $response = $this->scanTemplates();
        $data = $response->getData(true);
        if (!$data['success']) return $response;
        $applications = array_filter($data['templates'], fn($t) => $t['type'] === 'application');
        return response()->json(['success' => true, 'applications' => array_values($applications), 'total' => count($applications)]);
    }

    public function getWaybills()
    {
        $response = $this->scanTemplates();
        $data = $response->getData(true);
        if (!$data['success']) return $response;
        $waybills = array_filter($data['templates'], fn($t) => $t['type'] === 'waybill');
        return response()->json(['success' => true, 'waybills' => array_values($waybills), 'total' => count($waybills)]);
    }

    private function extractTemplateName($content, $filename)
    {
        if (preg_match('/<title>([^<]+)<\/title>/', $content, $matches)) {
            $title = trim($matches[1]);
            if (!empty($title) && strlen($title) < 100) return $title;
        }
        if (preg_match('/<h1[^>]*>([^<]+)<\/h1>/', $content, $matches)) {
            $h1 = trim($matches[1]);
            if (!empty($h1) && strlen($h1) < 100) return $h1;
        }
        return ucfirst(str_replace(['.html', '_'], ['', ' '], $filename));
    }

    private function extractFieldsWithAutoValidation($html)
    {
        // Ищем плейсхолдеры: {{ field }} или {{ field;label }}
        preg_match_all('/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:;([^}]*))?\s*}}/', $html, $matches, PREG_SET_ORDER);
        $fields = [];
        foreach ($matches as $match) {
            $placeholder = $match[1];
            if (in_array($placeholder, ['option_name', 'waybill_type_name', 'current_date'])) continue;

            // Если есть русская подпись после точки с запятой, используем её
            if (isset($match[2]) && trim($match[2]) !== '') {
                $label = trim($match[2]);
                $label = str_replace('_', ' ', $label); // заменяем подчёркивания на пробелы
            } else {
                // ищем подпись в HTML (старый метод)
                $label = $this->findLabelForField($placeholder, $html);
                if (!$label) {
                    $label = $this->translateFieldKey($placeholder);
                }
            }

            $validationType = $this->autoDetectValidationType($placeholder);
            $fields[] = [
                'key' => $placeholder,
                'label' => $label,
                'type' => $validationType['inputType'],
                'validation' => $validationType['rule'],
                'required' => true,
            ];
        }
        return $fields;
    }
    private function autoDetectValidationType($key)
    {
        $keyLower = strtolower($key);
        if (str_contains($keyLower, 'date')) return ['inputType' => 'date', 'rule' => 'date'];
        $numberKeywords = ['weight', 'count', 'quantity', 'number', 'distance', 'capacity', 'load', 'amount', 'price', 'sum'];
        foreach ($numberKeywords as $keyword) {
            if (str_contains($keyLower, $keyword)) return ['inputType' => 'number', 'rule' => 'number|min:1|max:100000'];
        }
        if (str_contains($keyLower, 'email')) return ['inputType' => 'email', 'rule' => 'email'];
        if (str_contains($keyLower, 'phone') || str_contains($keyLower, 'tel')) return ['inputType' => 'tel', 'rule' => 'phone'];
        return ['inputType' => 'text', 'rule' => 'required|max:255'];
    }

    /**
     * Улучшенный поиск подписи поля:
     * - атрибут data-label у элемента с плейсхолдером
     * - стандартные field-label / field-value
     * - заголовки таблиц <th>
     * - текст перед плейсхолдером, заканчивающийся двоеточием или пробелом
     */
    private function findLabelForField($placeholder, $html)
    {
        // 1. data-label атрибут
        if (preg_match('/<[^>]*\s+data-label=["\']([^"\']+)["\'][^>]*>{{\s*' . $placeholder . '\s*}}/', $html, $matches)) {
            return trim($matches[1]);
        }

        // 2. field-label / field-value
        $patterns = [
            '/<div[^>]*class="[^"]*field-label[^"]*"[^>]*>([^<]+)<\/div>\s*<div[^>]*class="[^"]*field-value[^"]*"[^>]*>{{\s*' . $placeholder . '\s*}}/s',
            '/<label[^>]*>([^<]*){{\s*' . $placeholder . '\s*}}<\/label>/s',
            '/<tr[^>]*>\s*<th[^>]*>([^<]+)<\/th>\s*<td[^>]*>{{\s*' . $placeholder . '\s*}}/s', // таблица: th в той же строке
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

        // 3. Если не нашли, можно попробовать поискать ближайший предыдущий <th> (упрощённо)
        // Не будем усложнять, вернём null – тогда label станет равным ключу поля
        return null;
    }
    /**
     * Автоматический перевод ключа поля на русский язык
     */
    private function translateFieldKey($key)
    {
        static $cache = [];
        if (isset($cache[$key])) {
            return $cache[$key];
        }

        // Локальный словарь (можно дополнять)
        $dictionary = [
            'sender_signature' => 'Подпись отправителя',
            'carrier_signature' => 'Подпись перевозчика',
            'notification_type' => 'Тип уведомления',
            'minutes' => 'Минуты',
            'day' => 'Число',
            'month' => 'Месяц',
            'hour' => 'Часы',
            'sequence_number' => 'Порядковый номер',
            'wagon_number' => 'Номер вагона',
            'container_number' => 'Номер контейнера',
            'seal_type' => 'Тип ЗПУ',
            'seal_mark' => 'Контрольный знак',
            'operation' => 'Операция',
            'cargo_name' => 'Наименование груза',
            'notes' => 'Примечание',
            'places_count' => 'Количество мест',
            'package_type' => 'Род упаковки',
            'weight' => 'Вес',
            'declared_value' => 'Объявленная ценность',
            'receiving_agent' => 'Приемосдатчик',
            'signature_sender' => 'Подпись отправителя',
            'signature_receiver' => 'Подпись перевозчика',
            'bid_number' => 'Номер заявки',
            'registration_date' => 'Дата регистрации',
            'departure_station' => 'Станция отправления',
            'arrival_station' => 'Станция прибытия',
            'load_capacity' => 'Грузоподъемность',
            'distance' => 'Расстояние',
            'document_number' => 'Номер документа',
            'station_name' => 'Станция',
            'road_name' => 'Дорога',
            'client_name' => 'Наименование клиента',
            'transfer_place' => 'Место передачи',
            'locomotive' => 'Локомотив',
            'cargo_type' => 'Тип груза',
            'train_number' => 'Номер поезда',
            'waybill_number' => 'Номер квитанции',
            'receipt_date' => 'Дата квитанции',
            'storage_hours' => 'Время хранения',
            'storage_address' => 'Адрес хранения',
            'agent_position' => 'Должность представителя',
            'agent_name' => 'ФИО представителя',
            'notification_datetime' => 'Дата и время уведомления',
            'application_number' => 'Номер заявки ГУ-12',
            'agreement_date' => 'Дата согласования',
            'payer_code' => 'Код плательщика',
            'payment_amount' => 'Сумма провозной платы',
            'contract_number' => 'Номер договора',
            'departure_station_code' => 'Код станции отправления',
            'arrival_station_code' => 'Код станции назначения',
            'cargo_code' => 'Код груза (ЕТСНГ)',
            'wagon_count' => 'Количество вагонов',
            'wagon_numbers' => 'Номера вагонов',
            'container_tare' => 'Тара контейнера',
            'container_capacity' => 'Грузоподъемность контейнера',
            'container_count' => 'Количество контейнеров',
            'container_numbers' => 'Номера контейнеров',
            'container_type' => 'Тип контейнера',
        ];

        if (isset($dictionary[$key])) {
            $cache[$key] = $dictionary[$key];
            return $dictionary[$key];
        }

        // Попытка перевода через Google Translate с отключённой проверкой SSL
        try {
            $text = str_replace('_', ' ', $key);
            $text = preg_replace('/[^a-zA-Z\s]/', '', $text);
            $text = trim($text);
            if (empty($text)) {
                return $key;
            }

            $ch = curl_init();
            $url = "https://translate.google.com/translate_a/single?client=gtx&hl=en&dt=t&sl=auto&tl=ru&q=" . urlencode($text);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // временно для разработки
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                throw new \Exception($error);
            }

            $data = json_decode($response, true);
            if (isset($data[0][0][0])) {
                $translated = $data[0][0][0];
                $translated = mb_convert_case($translated, MB_CASE_TITLE, "UTF-8");
                $cache[$key] = $translated;
                return $translated;
            }
        } catch (\Exception $e) {
            \Log::warning("Ошибка перевода поля '{$key}': " . $e->getMessage());
        }

        // Если ничего не помогло – возвращаем ключ
        $cache[$key] = $key;
        return $key;
    }
    // Добавьте этот метод в конец класса TemplateController

    public function getTemplatesList()
    {
        $templatesPath = public_path('templates');
        if (!is_dir($templatesPath)) {
            return response()->json([]);
        }

        $files = glob($templatesPath . '/*.html');
        $templates = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $html = file_get_contents($file);

            // Извлекаем название из <title> или <h1>
            $name = $this->extractTemplateName($html, $filename);

            // Определяем тип документа (заявка или накладная)
            $type = (strpos($filename, 'waybill') !== false || strpos($html, 'накладная') !== false)
                ? 'waybill'
                : 'application';

            // Извлекаем поля из HTML
            $fields = $this->extractFieldsWithAutoValidation($html);

            // Проверяем, есть ли уже этот тип в БД
            $existing = DB::table('document_types')->where('html_template', $filename)->first();

            if (!$existing) {
                // Автоматически создаём запись в БД
                $id = DB::table('document_types')->insertGetId([
                    'code' => $type . '_' . pathinfo($filename, PATHINFO_FILENAME),
                    'name' => $name,
                    'html_template' => $filename,
                    'fields_config' => json_encode($fields),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $id = $existing->id;
            }

            $templates[] = [
                'id' => $id,
                'filename' => $filename,
                'name' => $name,
                'type' => $type,
                'fields' => $fields,
                'html_content' => $html,
            ];
        }

        return response()->json($templates);
    }
}
