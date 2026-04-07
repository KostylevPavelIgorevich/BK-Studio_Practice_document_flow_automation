<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = DB::table('documents')->get();
        return response()->json($documents);
    }

    public function store(Request $request)
    {
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
