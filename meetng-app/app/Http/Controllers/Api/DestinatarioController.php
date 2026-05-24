<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDestinatarioRequest;
use App\Http\Resources\DestinatarioResource;
use App\Models\Encuesta;
use App\Models\Destinatario;
use App\Services\DestinatarioService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class DestinatarioController extends Controller
{
    use AuthorizesRequests;

    public function index(Encuesta $encuesta)
    {
        $this->authorize('asignarDestinatarios', $encuesta);

        $destinatarios = $encuesta->destinatarios()->with('usuario')->get();

        return DestinatarioResource::collection($destinatarios);
    }

    public function store(
        StoreDestinatarioRequest $request,
        Encuesta $encuesta,
        DestinatarioService $service
    ) {
        $this->authorize('asignarDestinatarios', $encuesta);

        $dest = $service->asignar($encuesta->id, $request->email);

        return new DestinatarioResource($dest);
    }

    public function update(Request $request, Encuesta $encuesta, DestinatarioService $service)
    {
        $this->authorize('asignarDestinatarios', $encuesta);

        $data = $request->validate([
            'user_ids'   => ['required', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $destinatarios = $service->syncDestinatarios($encuesta->id, $data['user_ids']);

        return DestinatarioResource::collection($destinatarios);
    }

    public function destroy(
        Encuesta $encuesta,
        Destinatario $destinatario,
        DestinatarioService $service
    ) {
        $this->authorize('asignarDestinatarios', $encuesta);

        // si el destinatario pertenece a esa encuesta
        if ($destinatario->encuesta_id !== $encuesta->id) {
            abort(404);
        }

        $service->eliminar($destinatario);

        return response()->json(['message' => 'Destinatario eliminado']);
    }
}