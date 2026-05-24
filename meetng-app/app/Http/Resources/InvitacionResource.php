<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InvitacionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'tipo'         => $this['tipo'],
            'id'           => $this['id'],
            'recurso_id'   => $this['recurso_id'],
            'asistente_id' => $this['asistente_id'] ?? null,
            'ha_votado'    => $this['ha_votado'] ?? null,
            'estado'       => $this['estado'],
            'fecha'        => $this['fecha'],
            'usuario'      => $this['usuario'],
            'created_at'   => $this['created_at'],
        ];
    }
}