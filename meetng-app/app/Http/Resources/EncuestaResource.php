<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EncuestaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'titulo'        => $this->titulo,
            'descripcion'   => $this->descripcion,
            'tipo'          => $this->tipo,
            'estado'        => $this->estado,
            'fecha_limite'  => $this->fecha_limite,

            'opciones'      => OpcionEncuestaResource::collection(
                $this->whenLoaded('opciones')
            ),

            'destinatarios' => DestinatarioResource::collection(
                $this->whenLoaded('destinatarios')
            ),

            'usuario'       => [
                'id'    => $this->usuario->id,
                'name'  => $this->usuario->name,
                'email' => $this->usuario->email,
            ],

            'reunion_id'    => $this->reunion_id,
            'created_at'    => $this->created_at,
        ];
    }
}
