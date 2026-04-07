<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentField extends Model
{
    protected $fillable = [
        'document_id',
        'field_key',
        'field_value',
    ];

    // Связь: поле belongs to document
    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
