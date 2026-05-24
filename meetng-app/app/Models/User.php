<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Asistente;
use App\Models\Rol;
use App\Models\Reunion;
use App\Models\RespuestaEncuesta;
use App\Models\OpcionEncuesta;
use App\Models\Encuesta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class);
    }

    // Reuniones creadas por el usuario
    public function reunionesCreadas()
    {
        return $this->hasMany(Reunion::class);
    }

    // Asistencias a reuniones
    public function asistencias()
    {
        return $this->hasMany(Asistente::class);
    }

    // Encuestas creadas por el usuario
    public function encuestasCreadas()
    {
        return $this->hasMany(Encuesta::class);
    }

    // Encuestas en las que es destinatario
    public function encuestasRecibidas()
    {
        return $this->hasMany(Destinatario::class);
    }

    // Respuestas del usuario a encuestas
    public function respuestasEncuesta()
    {
        return $this->hasMany(RespuestaEncuesta::class);
    }

    // Opciones de encuesta creadas por el usuario
    public function opcionesEncuesta()
    {
        return $this->hasMany(OpcionEncuesta::class);
    }
}
