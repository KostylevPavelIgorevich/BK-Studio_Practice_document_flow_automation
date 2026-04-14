<?php
// app/Http/Controllers/GroupController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index()
    {
        $groups = DB::table('groups')->get();
        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:groups,name',
        ], [
            'name.unique' => 'Группа с таким названием уже существует',
        ]);

        $id = DB::table('groups')->insertGetId([
            'name' => $request->name,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'id' => $id,
            'name' => $request->name
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:groups,name,' . $id
        ]);

        DB::table('groups')->where('id', $id)->update([
            'name' => $request->name,
            'updated_at' => now()
        ]);

        return response()->json(['id' => $id, 'name' => $request->name]);
    }

    public function destroy($id)
    {
        DB::table('groups')->where('id', $id)->delete();
        return response()->json(null, 204);
    }
}
