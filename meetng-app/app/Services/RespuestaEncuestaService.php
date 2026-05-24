<?php

namespace App\Services;

use App\Models\RespuestaEncuesta;
use App\Models\OpcionEncuesta;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class RespuestaEncuestaService
{
    /**
     * Registra un voto asegurando que el usuario tenga solo UN voto por encuesta.
     * Borra votos previos del usuario para la encuesta y crea el nuevo voto.
     *
     * @param int $opcionId
     * @param string $respuesta
     * @param int $userId
     * @return RespuestaEncuesta
     *
     * @throws ModelNotFoundException
     */
    public function votar(int $opcionId, string $respuesta, int $userId)
    {
        $opcion = OpcionEncuesta::find($opcionId);

        if (! $opcion) {
            throw new ModelNotFoundException("Opción de encuesta no encontrada.");
        }

        return DB::transaction(function () use ($opcion, $opcionId, $respuesta, $userId) {
            // Borrar votos previos del usuario para esta encuesta (todas las opciones de la encuesta)
            RespuestaEncuesta::whereIn(
                'opcion_encuesta_id',
                $opcion->encuesta()->first()->opciones()->pluck('id')
            )->where('user_id', $userId)->delete();

            // Crear el nuevo voto
            return RespuestaEncuesta::create([
                'opcion_encuesta_id' => $opcionId,
                'user_id' => $userId,
                'respuesta' => $respuesta,
                'fecha_respuesta' => now(),
            ]);
        });
    }
}