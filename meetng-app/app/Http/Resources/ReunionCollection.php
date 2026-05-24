<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ReunionCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection->transform(function ($reunion) {
                return [
                    'id'           => $reunion->id,
                    'titulo'       => $reunion->titulo,
                    'estado'       => $reunion->estado,
                    'fecha_inicio' => $reunion->fecha_inicio,
                    'fecha_fin'    => $reunion->fecha_fin,
                ];
            })
        ];
    }
}
