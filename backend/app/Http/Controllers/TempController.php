<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TempController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'ok', 'message' => 'Temp controller works']);
    }

    public function store(Request $request)
    {
        return response()->json([
            'status' => 'ok',
            'received' => $request->all()
        ]);
    }
}
