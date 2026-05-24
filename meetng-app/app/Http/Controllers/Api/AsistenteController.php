<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAsistenteRequest;
use App\Http\Requests\UpdateAsistenteRequest;
use App\Http\Resources\AsistenteResource;
use App\Models\Asistente;
use App\Models\Reunion;
use App\Services\AsistenteService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AsistenteController extends Controller
{
    use AuthorizesRequests;

    public function index(Reunion $reunion, AsistenteService $service)
    {
        $this->authorize('verAsistentes', $reunion);

        $asistentes = $service->lista($reunion);
        return AsistenteResource::collection($asistentes);
    }

    public function store(StoreAsistenteRequest $request, Reunion $reunion, AsistenteService $service)
    {
        $this->authorize('añadirAsistente', $reunion);

        $asistente = $service->crear($reunion, $request->email);

        return new AsistenteResource($asistente);
    }

    public function update(UpdateAsistenteRequest $request, Asistente $asistente, AsistenteService $service)
    {
        
        $this->authorize('responderInvitacion', $asistente);

        $asistente = $service->actualizarEstado($asistente, $request->estado);

        return new AsistenteResource($asistente);
    }

    public function destroy(Reunion $reunion, Asistente $asistente, AsistenteService $service)
    {
        $this->authorize('eliminarAsistente', $asistente);

        if ($asistente->reunion_id !== $reunion->id) {
            abort(404);
        }

        $service->eliminar($asistente);

        return response()->json(['message' => 'Asistente eliminado']);
    }

    public function confirmar(Asistente $asistente, AsistenteService $service)
    {
        $this->authorize('responderInvitacion', $asistente);

        $asistente = $service->confirmar($asistente);

        return new AsistenteResource($asistente);
    }

    public function rechazar(Asistente $asistente, AsistenteService $service)
    {
        $this->authorize('responderInvitacion', $asistente);

        $asistente = $service->rechazar($asistente);

        return new AsistenteResource($asistente);
    }
}