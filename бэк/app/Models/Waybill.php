<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Waybill extends Model
{
    protected $fillable = [
        'user_id',
        'application_type',
        'waybill_type',
        'form_type',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    // Связь: накладная belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
