<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReunionResource extends JsonResource
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
            'lugar'         => $this->lugar,
            'fecha_inicio'  => $this->fecha_inicio,
            'fecha_fin'     => $this->fecha_fin,
            'estado'        => $this->estado,

            // Relación con encuesta
            'encuesta'      => $this->whenLoaded('encuesta', function () {
                return new EncuestaResource($this->encuesta);
            }),

            // Relación con asistentes
            'asistentes'    => AsistenteResource::collection(
                $this->whenLoaded('asistentes')
            ),

            'creador'       => [
                'id'    => $this->usuario->id,
                'name'  => $this->usuario->name,
                'email' => $this->usuario->email,
            ],

            'created_at'    => $this->created_at,
        ];
    }
}
