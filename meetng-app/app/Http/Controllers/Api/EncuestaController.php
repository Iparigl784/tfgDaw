<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEncuestaRequest;
use App\Http\Requests\UpdateEncuestaRequest;
use App\Http\Resources\EncuestaResource;
use App\Models\Encuesta;
use Illuminate\Http\Request;
use App\Services\EncuestaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EncuestaController extends Controller
{
    use AuthorizesRequests;

    /**
     * Listado de encuestas
     */
    public function index(Request $request, EncuestaService $service)
    {
        $this->authorize('viewAny', Encuesta::class);

        $filters = $request->only(['estado', 'desde', 'hasta']);

        $encuestas = $service
            ->getEncuestas(auth()->user(), $filters)
            ->paginate(9);

        return EncuestaResource::collection($encuestas);
    }

    /**
     * Crear encuesta
     */
    public function store(StoreEncuestaRequest $request, EncuestaService $service)
    {
        $this->authorize('create', Encuesta::class);

        $encuesta = $service->alta($request->validated());

        return new EncuestaResource($encuesta);
    }

    /**
     * Mostrar encuesta
     */
    public function show(Encuesta $encuesta)
    {
        $this->authorize('view', $encuesta);

        return new EncuestaResource(
            $encuesta->load(['opciones', 'reunion', 'destinatarios'])
        );
    }

    /**
     * Actualizar encuesta
     */
    public function update(UpdateEncuestaRequest $request, Encuesta $encuesta, EncuestaService $service)
    {
        $this->authorize('update', $encuesta);

        $encuesta = $service->actualizar($encuesta, $request->validated());

        return new EncuestaResource(
            $encuesta->load(['opciones', 'destinatarios', 'reunion'])
        );

    }

    /**
     * Eliminar encuesta
     */
    public function destroy(Encuesta $encuesta)
    {
        $this->authorize('delete', $encuesta);

        $encuesta->delete();

        return response()->json([
            'message' => 'Encuesta eliminada correctamente'
        ], 200);
    }

    public function misEncuestas(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['estado', 'desde', 'hasta']);

        $q = $user->encuestasCreadas()
            ->with(['opciones', 'reunion'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['estado'])) {
            $q->where('estado', $filters['estado']);
        }

        if (!empty($filters['desde'])) {
            $q->where('created_at', '>=', $filters['desde']);
        }

        if (!empty($filters['hasta'])) {
            $q->where('fecha_limite', '<=', $filters['hasta']);
        }

        return EncuestaResource::collection($q->paginate(9));
    }

    public function cerrar(Encuesta $encuesta, EncuestaService $service)
    {
        $this->authorize('cerrar', $encuesta);

        if ($encuesta->estado !== 'activa') {
            return response()->json([
                'message' => 'La encuesta ya está cerrada o no está activa.'
            ], 400);
        }

        $reunion = $service->cerrarEncuesta($encuesta);

        return response()->json([
            'message' => 'Encuesta cerrada correctamente.',
            'reunion' => $reunion
        ]);
    }
}
