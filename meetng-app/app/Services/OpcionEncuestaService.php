<?php

namespace App\Services;

use App\Models\OpcionEncuesta;
use App\Models\Encuesta;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OpcionEncuestaService
{
    public function crear(array $data): OpcionEncuesta
    {
        return DB::transaction(function () use ($data) {
            return OpcionEncuesta::create([
                'fecha_inicio' => $data['fecha_inicio'],
                'fecha_fin'    => $data['fecha_fin'],
                'estado'       => $data['estado'],
                'encuesta_id'  => $data['encuesta_id'],
                'user_id'      => Auth::id(),
            ]);
        });
    }

    public function actualizar(OpcionEncuesta $opcion, array $data): OpcionEncuesta
    {
        return DB::transaction(function () use ($opcion, $data) {
            $opcion->update($data);
            return $opcion;
        });
    }

    public function obtenerPorEncuesta(Encuesta $encuesta)
    {
        return $encuesta->opciones()->with('usuario')->ordenadas()->get();
    }
}
