<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinatarioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'        => $this->id,

            'usuario'   => [
                'id'    => $this->usuario->id,
                'name'  => $this->usuario->name,
                'email' => $this->usuario->email,
            ],

            'encuesta_id' => $this->encuesta_id,
        ];
    }
}
