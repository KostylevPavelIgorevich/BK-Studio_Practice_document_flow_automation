<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'user_id',
        'document_type_id',
        'status',
        'form_data',
    ];

    protected $casts = [
        'form_data' => 'array',
    ];

    // Связь: документ belongs to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Связь: документ belongs to document type
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    // Связь: документ может иметь много полей
    public function fields()
    {
        return $this->hasMany(DocumentField::class);
    }

    // Связь: документ может иметь много записей в истории печати
    public function printHistory()
    {
        return $this->hasMany(PrintHistory::class);
    }
}
