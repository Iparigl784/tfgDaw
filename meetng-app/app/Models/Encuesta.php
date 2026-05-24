<?php

namespace App\Models;

use App\Models\User;
use App\Models\Reunion;
use App\Models\OpcionEncuesta;
use App\Models\Destinatario;
use App\Models\RespuestaEncuesta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Encuesta extends Model
{
    use HasFactory;

    protected $table = 'encuestas';
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
        'titulo',
        'descripcion',
        'tipo',
        'estado',
        'fecha_limite',
        'reunion_id',
        'user_id'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reunion()
    {
        return $this->belongsTo(Reunion::class, 'reunion_id');
    }

    public function opciones()
    {
        return $this->hasMany(OpcionEncuesta::class, 'encuesta_id');
    }

    public function destinatarios()
    {
        return $this->hasMany(Destinatario::class, 'encuesta_id');
    }

    public function haVotado(User $user)
    {
        return RespuestaEncuesta::whereHas('opcion', function ($q) {
                $q->where('encuesta_id', $this->id);
            })
            ->where('user_id', $user->id)
            ->exists();
    }

    // SCOPES
    public function scopeDelUsuario($query, User $user)
    {
        if ($user->rol->slug === 'admin') {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }

    public function scopeRecientes($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

}
