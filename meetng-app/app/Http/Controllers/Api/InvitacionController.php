<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Encuesta;
use App\Models\Reunion;
use App\Http\Resources\InvitacionResource;
use Illuminate\Pagination\LengthAwarePaginator;

class InvitacionController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        // Encuestas donde soy destinatario
        $encuestas = Encuesta::with(['usuario'])
            ->whereHas('destinatarios', fn($q) => $q->where('user_id', $userId))
            ->get()

            // Aseguramos que cada item sea un MODELO Eloquent real
            ->map(function ($item) {
                return Encuesta::with('usuario')->find($item->id);
            })

            ->map(function ($encuesta) use ($userId) {

                $haVotado = $encuesta->haVotado(auth()->user());

                return [
                    'tipo'        => 'encuesta',
                    'id'          => $encuesta->id,
                    'recurso_id'  => $encuesta->id,
                    'ha_votado'   => $haVotado,
                    'estado'      => $encuesta->estado,
                    'fecha'       => $encuesta->fecha_limite,
                    'usuario'     => [
                        'id'   => $encuesta->usuario->id,
                        'name' => $encuesta->usuario->name,
                    ],
                    'created_at'  => $encuesta->created_at,
                ];
            })

            // Filtrar encuestas ya votadas
            ->filter(fn($e) => !$e['ha_votado'])
            ->values();



        // Reuniones donde soy asistente
        $reuniones = Reunion::with(['usuario', 'asistentes'])
            ->whereHas('asistentes', fn($q) => $q->where('user_id', $userId))
            ->get()

            // Aseguramos que cada item sea un MODELO Eloquent real
            ->map(function ($item) {
                return Reunion::with(['usuario', 'asistentes'])->find($item->id);
            })

            ->map(function ($reunion) use ($userId) {

                $asistente = $reunion->asistentes->firstWhere('user_id', $userId);

                return [
                    'tipo'         => 'reunion',
                    'id'           => $reunion->id,
                    'recurso_id'   => $reunion->id,
                    'asistente_id' => $asistente?->id,
                    'estado'       => $asistente?->estado ?? 'pendiente',
                    'fecha'        => $reunion->fecha_inicio,
                    'usuario'      => [
                        'id'   => $reunion->usuario->id,
                        'name' => $reunion->usuario->name,
                    ],
                    'created_at'   => $reunion->created_at,
                ];
            })

            // Filtrar reuniones donde el estado NO es pendiente
            ->filter(fn($r) => $r['estado'] === 'pendiente')
            ->values();



        // Unificar y paginación
        $items = $encuestas->merge($reuniones)
            ->sortByDesc('created_at')
            ->values();

        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 10;

        $results = $items->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $results,
            $items->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return InvitacionResource::collection($paginator);
    }
}