<?php

namespace App\Models;

use App\Models\User;
use App\Models\OpcionEncuesta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RespuestaEncuesta extends Model
{
    use HasFactory;

    protected $table = 'respuesta_encuestas';
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
        'respuesta',
        'fecha_respuesta',
        'opcion_encuesta_id',
        'user_id'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function opcion()
    {
        return $this->belongsTo(OpcionEncuesta::class, 'opcion_encuesta_id');
    }
}
