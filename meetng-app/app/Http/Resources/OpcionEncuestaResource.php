<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpcionEncuestaResource extends JsonResource
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
            'fecha_inicio'  => $this->fecha_inicio,
            'fecha_fin'     => $this->fecha_fin,

            'votos' => RespuestaEncuestaResource::collection(
                $this->whenLoaded('respuestas')
            ),

            'votos_si' => $this->when(isset($this->votos_si), $this->votos_si),
        ];
    }
}
