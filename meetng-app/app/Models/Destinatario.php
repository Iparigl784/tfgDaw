<?php

namespace App\Models;

use App\Models\User;
use App\Models\Encuesta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Destinatario extends Model
{
   use HasFactory;

   protected $table = 'destinatarios';
   public $timestamps = true;
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'id',
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
}
