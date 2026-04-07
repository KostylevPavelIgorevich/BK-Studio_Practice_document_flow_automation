<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = [
        'name',
    ];

    // Связь: у группы может быть много пользователей
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
