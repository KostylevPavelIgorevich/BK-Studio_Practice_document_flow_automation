<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'login',
        'password',
        'last_name',
        'first_name',
        'middle_name',
        'role_id',
        'group_id',
    ];

    protected $hidden = [
        'password',
    ];

    // Связь: пользователь belongs to role
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // Связь: пользователь belongs to group
    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    // Связь: пользователь может иметь много документов
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
