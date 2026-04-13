<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = DB::table('documents')->get();
        return response()->json($documents);
    }

    /**
     * Динамически строит правила валидации для form_data на основе ключей полей
     */
    private function buildFormDataRules($formData)
    {
        $rules = [];
        $messages = [];

        foreach ($formData as $key => $value) {
            $lowerKey = strtolower($key);

            // Только цифры (номера, коды, количества)
            if (preg_match('/(number|num|count|quantity|code|номер|код|кол-во)/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|regex:/^\d+$/';
                $messages["form_data.{$key}.regex"] = "Поле '{$key}' должно содержать только цифры";
                continue;
            }

            // Числовые значения (вес, масса, расстояние, объём, цена)
            if (preg_match('/(weight|mass|distance|capacity|load|amount|price|sum|вес|масса|расстояние)/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|numeric|min:0';
                $messages["form_data.{$key}.numeric"] = "Поле '{$key}' должно быть числом";
                $messages["form_data.{$key}.min"] = "Поле '{$key}' не может быть отрицательным";
                continue;
            }

            // Время (HH:MM)
            if (preg_match('/(time|час|время)/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|date_format:H:i';
                $messages["form_data.{$key}.date_format"] = "Поле '{$key}' должно быть в формате ЧЧ:ММ (например, 14:30)";
                continue;
            }

            // Дата
            if (preg_match('/(date|дата)/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|date';
                $messages["form_data.{$key}.date"] = "Поле '{$key}' должно быть корректной датой";
                continue;
            }

            // Email
            if (preg_match('/email/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|email';
                $messages["form_data.{$key}.email"] = "Поле '{$key}' должно быть email-адресом";
                continue;
            }

            // Телефон
            if (preg_match('/(phone|tel)/i', $lowerKey)) {
                $rules["form_data.{$key}"] = 'required|regex:/^[\d\s\+\(\)\-]{10,20}$/';
                $messages["form_data.{$key}.regex"] = "Поле '{$key}' должно содержать корректный номер телефона";
                continue;
            }

            // По умолчанию – текст
            $rules["form_data.{$key}"] = 'required|string|max:255';
            $messages["form_data.{$key}.max"] = "Поле '{$key}' не может быть длиннее 255 символов";
        }

        return [$rules, $messages];
    }

    public function store(Request $request)
    {
        // Принудительно преобразуем document_type_id в int
        $documentTypeId = (int) $request->input('document_type_id');
        $userId = (int) $request->input('user_id');
        $formData = $request->input('form_data', []);

        // Базовая валидация
        $validator = Validator::make(
            [
                'user_id' => $userId,
                'document_type_id' => $documentTypeId,
                'form_data' => $formData,
            ],
            [
                'user_id' => 'required|integer|exists:users,id',
                'document_type_id' => 'required|integer|exists:document_types,id',
                'form_data' => 'required|array',
            ],
            [
                'user_id.required' => 'Не указан пользователь',
                'user_id.exists' => 'Пользователь не существует',
                'document_type_id.required' => 'Не указан тип документа',
                'document_type_id.exists' => 'Тип документа не существует',
                'form_data.required' => 'Отсутствуют данные формы',
                'form_data.array' => 'Данные формы должны быть массивом',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Динамические правила для form_data
        [$formRules, $formMessages] = $this->buildFormDataRules($formData);

        $formValidator = Validator::make(
            ['form_data' => $formData],
            $formRules,
            $formMessages
        );

        if ($formValidator->fails()) {
            return response()->json(['errors' => $formValidator->errors()], 422);
        }

        $id = DB::table('documents')->insertGetId([
            'user_id' => $userId,
            'document_type_id' => $documentTypeId,
            'status' => 'draft',
            'form_data' => json_encode($formData),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['id' => $id]);
    }

    public function show($id)
    {
        $document = DB::table('documents')->where('id', $id)->first();
        return response()->json($document);
    }

    public function update(Request $request, $id)
    {
        $formData = $request->input('form_data', []);

        // Базовая валидация
        $validator = Validator::make(
            ['form_data' => $formData],
            ['form_data' => 'required|array'],
            ['form_data.required' => 'Отсутствуют данные формы']
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Динамические правила для form_data
        [$formRules, $formMessages] = $this->buildFormDataRules($formData);

        $formValidator = Validator::make(
            ['form_data' => $formData],
            $formRules,
            $formMessages
        );

        if ($formValidator->fails()) {
            return response()->json(['errors' => $formValidator->errors()], 422);
        }

        DB::table('documents')->where('id', $id)->update([
            'form_data' => json_encode($formData),
            'updated_at' => now()
        ]);

        return response()->json(['id' => $id]);
    }

    public function destroy($id)
    {
        DB::table('documents')->where('id', $id)->delete();
        return response()->json(null, 204);
    }

    public function printDocument($id)
    {
        $document = DB::table('documents')->where('id', $id)->first();
        $html = '<h1>Документ №' . $id . '</h1><pre>' . json_encode($document, JSON_PRETTY_PRINT) . '</pre>';
        return response()->json(['html' => $html]);
    }
}
