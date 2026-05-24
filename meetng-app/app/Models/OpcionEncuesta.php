<?php

namespace App\Models;

use App\Models\User;
use App\Models\Encuesta;
use App\Models\RespuestaEncuesta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OpcionEncuesta extends Model
{
    use HasFactory;

    protected $table = 'opcion_encuestas';
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'encuesta_id',
        'user_id'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function encuesta()
    {
        return $this->belongsTo(Encuesta::class, 'encuesta_id');
    }

    public function respuestas()
    {
        return $this->hasMany(RespuestaEncuesta::class, 'opcion_encuesta_id');
    }

    // SCOPES
    public function scopeOrdenadas($query)
    {
        return $query->orderBy('fecha_inicio');
    }
}
