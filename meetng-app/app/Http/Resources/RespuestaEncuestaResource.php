<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RespuestaEncuestaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'respuesta'         => $this->respuesta,
            'fecha_respuesta'   => $this->fecha_respuesta,
            'opcion_encuesta_id' => $this->opcion_encuesta_id,

            'usuario' => [
                'id'    => $this->usuario->id,
                'name'  => $this->usuario->name,
                'email' => $this->usuario->email,
            ],
        ];
    }
}
