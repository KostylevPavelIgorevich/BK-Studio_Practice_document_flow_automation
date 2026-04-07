<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class WaybillController extends Controller
{
    public function store(Request $request)
    {
        $id = DB::table('waybills')->insertGetId([
            'user_id' => $request->user_id ?? 1,
            'application_type' => $request->application_type,
            'waybill_type' => $request->waybill_type,
            'form_type' => $request->form_type,
            'data' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        return response()->json(['id' => $id]);
    }

    public function save(Request $request, $id)
    {
        DB::table('waybills')->where('id', $id)->update([
            'data' => json_encode($request->all()),
            'updated_at' => now()
        ]);
        return response()->json(['id' => $id]);
    }

    public function printWaybill($id)
    {
        $waybill = DB::table('waybills')->where('id', $id)->first();
        $html = '<h1>Накладная №' . $id . '</h1><pre>' . json_encode($waybill, JSON_PRETTY_PRINT) . '</pre>';
        return response()->json(['html' => $html]);
    }
}
