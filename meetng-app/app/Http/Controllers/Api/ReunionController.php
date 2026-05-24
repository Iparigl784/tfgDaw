<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReunionRequest;
use App\Http\Requests\UpdateReunionRequest;
use App\Http\Resources\ReunionResource;
use App\Http\Resources\ReunionCollection;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Reunion;
use Illuminate\Http\Request;
use App\Services\ReunionService;

class ReunionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Listado de reuniones
     */
    public function index(Request $request, ReunionService $service)
    {
        $filters = $request->only(['estado', 'desde', 'hasta']);

        $reuniones = $service
            ->getReuniones(auth()->user(), $filters)
            ->paginate(9);

        return ReunionResource::collection($reuniones);
    }

    /**
     * Crear reunión
     */
    public function store(StoreReunionRequest $request, ReunionService $service)
    {
        $this->authorize('create', Reunion::class);

        $reunion = $service->alta($request->validated());

        return new ReunionResource($reunion);
    }

    /**
     * Mostrar reunión
     */
    public function show(Reunion $reunion)
    {
        $this->authorize('view', $reunion);

        // Cargar relaciones relevantes para el frontend
        $reunion->load([
            'asistentes',
            'encuesta',
            'encuesta.opciones',
            'encuesta.destinatarios'
        ]);

        return new ReunionResource($reunion);
    }

    /**
     * Actualizar reunión
     */
    public function update(UpdateReunionRequest $request, Reunion $reunion, ReunionService $service)
    {
        $this->authorize('update', $reunion);

        $reunion = $service->actualizar($reunion, $request->validated());

        return new ReunionResource($reunion);
    }

    /**
     * Eliminar reunión
     */
    public function destroy(Reunion $reunion)
    {
        $this->authorize('delete', $reunion);

        $reunion->delete();

        return response()->json([
            'message' => 'Reunión eliminada correctamente'
        ], 200);
    }

    public function misReuniones(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['estado', 'desde', 'hasta']);

        $q = $user->reunionesCreadas()
            ->with(['opcion', 'encuesta', 'asistentes'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['estado'])) {
            $q->where('estado', $filters['estado']);
        }

        if (!empty($filters['desde'])) {
            $q->where('fecha_inicio', '>=', $filters['desde']);
        }

        if (!empty($filters['hasta'])) {
            $q->where('fecha_fin', '<=', $filters['hasta']);
        }

        return ReunionResource::collection($q->paginate(9));
    }

    public function misAsistencias(Request $request)
    {
        $user = $request->user();

        $reuniones = Reunion::whereHas('asistentes', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                ->where('estado', 'confirmado');
            })
            ->with(['asistentes', 'encuesta', 'opcion'])
            ->orderBy('fecha_inicio', 'asc')
            ->paginate(9);

        return ReunionResource::collection($reuniones);
    }

}