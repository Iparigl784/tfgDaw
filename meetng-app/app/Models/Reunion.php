<?php

namespace App\Models;

use App\Models\Asistente;
use App\Models\User;
use App\Models\Encuesta;
use App\Models\OpcionEncuesta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reunion extends Model
{
    use HasFactory;

    protected $table = 'reuniones';
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
        'titulo',
        'descripcion',
        'lugar',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'opcion_encuesta_id',
        'user_id'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function encuesta()
    {
        return $this->hasOne(Encuesta::class);
    }

    public function opcion()
    {
        return $this->belongsTo(OpcionEncuesta::class, 'opcion_encuesta_id');
    }

    public function asistentes()
    {
        return $this->hasMany(Asistente::class, 'reunion_id');
    }

    // SCOPES
    public function scopeDelUsuario($query, User $user)
    {
        if ($user->rol->slug === 'admin') {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }

    public function scopeOrdenadas($query)
    {
        return $query->orderBy('fecha_inicio', 'desc');
    }

    public function scopeFinalizadasPendientes($query)
    {
        return $query
            ->whereIn('estado', ['programada', 'pendiente_encuesta'])
            ->where('fecha_fin', '<', now());
    }
}
