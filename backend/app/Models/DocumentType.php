<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = [
        'code',
        'name',
        'html_template',
        'fields_config',
    ];

    protected $casts = [
        'fields_config' => 'array',
    ];

    // Связь: тип документа может иметь много документов
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
