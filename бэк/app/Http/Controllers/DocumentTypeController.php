<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DocumentTypeController extends Controller
{
    public function index()
    {
        $types = DB::table('document_types')->get();
        return response()->json($types);
    }

    public function getFields($code)
    {
        // Получаем тип документа из БД
        $documentType = DB::table('document_types')
            ->where('code', $code)
            ->first();

        if (!$documentType) {
            return response()->json([]);
        }

        // fields_config уже хранится в JSON, просто декодируем и возвращаем
        $fields = json_decode($documentType->fields_config, true);

        return response()->json($fields ?? []);
    }
}
