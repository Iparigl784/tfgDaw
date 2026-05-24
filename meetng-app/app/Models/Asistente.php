<?php

namespace App\Models;

use App\Models\User;
use App\Models\Reunion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asistente extends Model
{
    use HasFactory;

    protected $table = 'asistentes';
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
        'nombre',
        'email',
        'estado',
        'reunion_id',
        'user_id'
    ];

    // Relación: un asistente es un usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reunion()
    {
        return $this->belongsTo(Reunion::class, 'reunion_id');
    }
}
