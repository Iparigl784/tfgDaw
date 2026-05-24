<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRespuestaEncuestaRequest;
use App\Http\Requests\UpdateRespuestaEncuestaRequest;
use App\Http\Resources\RespuestaEncuestaResource;
use App\Models\Encuesta;
use App\Models\RespuestaEncuesta;
use App\Services\RespuestaEncuestaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RespuestaEncuestaController extends Controller
{
    use AuthorizesRequests;

    public function index(Encuesta $encuesta)
    {
        $this->authorize('verVotos', $encuesta);

        $votos = RespuestaEncuesta::whereIn(
                'opcion_encuesta_id',
                $encuesta->opciones()->pluck('id')
            )
            ->with(['usuario', 'opcion'])
            ->get();

        return RespuestaEncuestaResource::collection($votos);
    }

    public function store(
        StoreRespuestaEncuestaRequest $request,
        Encuesta $encuesta,
        RespuestaEncuestaService $service
    ) {
        $this->authorize('votar', $encuesta);

        $voto = $service->votar(
            $request->opcion_encuesta_id,
            $request->respuesta,
            auth()->id()
        );

        return new RespuestaEncuestaResource($voto);
    }

    public function update(
        UpdateRespuestaEncuestaRequest $request,
        Encuesta $encuesta,
        RespuestaEncuestaService $service
    ) {
        $this->authorize('votar', $encuesta);

        $voto = $service->votar(
            $request->opcion_encuesta_id,
            $request->respuesta,
            auth()->id()
        );

        return new RespuestaEncuestaResource($voto);
    }

    public function misVotos(Encuesta $encuesta)
    {
        $this->authorize('verMisVotos', $encuesta);

        $votos = RespuestaEncuesta::where('user_id', auth()->id())
            ->whereIn('opcion_encuesta_id', $encuesta->opciones()->pluck('id'))
            ->get();

        return RespuestaEncuestaResource::collection($votos);
    }

    public function resultados(Encuesta $encuesta)
    {
        $this->authorize('verResultados', $encuesta);

        $resultados = $encuesta->opciones()
            ->withCount('respuestas')
            ->get()
            ->map(function ($opcion) {
                return [
                    'id'            => $opcion->id,
                    'fecha_inicio'  => $opcion->fecha_inicio,
                    'fecha_fin'     => $opcion->fecha_fin,
                    'total_votos'   => $opcion->respuestas_count,
                ];
            });

        return response()->json([
            'encuesta_id' => $encuesta->id,
            'resultados'  => $resultados
        ]);
    }
}