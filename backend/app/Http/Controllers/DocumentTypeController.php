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

    public function store(Request $request)
    {
        $id = DB::table('document_types')->insertGetId([
            'code' => $request->code,
            'name' => $request->name,
            'html_template' => $request->html_template,
            'fields_config' => $request->fields_config,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return response()->json(['id' => $id]);
    }

    public function getFields($code)
    {
        $documentType = DB::table('document_types')
            ->where('code', $code)
            ->first();

        if (!$documentType) {
            return response()->json([]);
        }

        $fields = json_decode($documentType->fields_config, true);
        return response()->json($fields ?? []);
    }
}
