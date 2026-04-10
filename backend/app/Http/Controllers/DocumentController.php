<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator; // ← добавили

class DocumentController extends Controller
{
    public function index()
    {
        $documents = DB::table('documents')->get();
        return response()->json($documents);
    }

    public function store(Request $request)
    {
        // Валидация
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'document_type_id' => 'required|integer|exists:document_types,id',
            'form_data' => 'required|array',
        ], [
            'user_id.required' => 'Не указан пользователь',
            'user_id.exists' => 'Пользователь не существует',
            'document_type_id.required' => 'Не указан тип документа',
            'document_type_id.exists' => 'Тип документа не существует',
            'form_data.required' => 'Отсутствуют данные формы',
            'form_data.array' => 'Данные формы должны быть массивом',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $id = DB::table('documents')->insertGetId([
            'user_id' => $request->user_id,
            'document_type_id' => $request->document_type_id,
            'status' => 'draft',
            'form_data' => json_encode($request->form_data),
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
        // Валидация
        $validator = Validator::make($request->all(), [
            'form_data' => 'required|array',
        ], [
            'form_data.required' => 'Отсутствуют данные формы',
            'form_data.array' => 'Данные формы должны быть массивом',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::table('documents')->where('id', $id)->update([
            'form_data' => json_encode($request->form_data),
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
