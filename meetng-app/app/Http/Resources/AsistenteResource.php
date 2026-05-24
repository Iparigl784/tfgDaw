<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AsistenteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'nombre'    => $this->nombre,
            'email'     => $this->email,
            'estado'    => $this->estado_asistencia ?? $this->estado,

            'usuario' => $this->when($this->usuario, function () {
                return [
                    'id'    => $this->usuario->id,
                    'name'  => $this->usuario->name,
                    'email' => $this->usuario->email,
                ];
            }),

            'reunion_id' => $this->reunion_id,
        ];
    }
}