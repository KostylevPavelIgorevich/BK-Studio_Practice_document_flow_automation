<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintHistory extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'printed_at',
    ];

    protected $casts = [
        'printed_at' => 'datetime',
    ];

    // Связь: запись истории belongs to document
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    // Связь: запись истории belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
