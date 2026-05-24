<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OpcionEncuestaResource;
use App\Models\Encuesta;
use App\Services\OpcionEncuestaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OpcionEncuestaController extends Controller
{
    use AuthorizesRequests;

    public function index(Encuesta $encuesta, OpcionEncuestaService $service)
    {
        $this->authorize('view', $encuesta);

        $opciones = $service->obtenerPorEncuesta($encuesta);
        return OpcionEncuestaResource::collection($opciones);
    }
}