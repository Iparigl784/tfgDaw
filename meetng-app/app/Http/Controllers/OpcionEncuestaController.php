<?php

namespace App\Http\Controllers;

use App\Models\Encuesta;
use App\Models\OpcionEncuesta;
use App\Services\OpcionEncuestaService;
use App\Http\Requests\StoreOpcionEncuestaRequest;
use App\Http\Requests\UpdateOpcionEncuestaRequest;

class OpcionEncuestaController extends Controller
{
    protected $service;

    public function __construct(OpcionEncuestaService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Encuesta $encuesta)
    {
        $opciones = $this->service->obtenerPorEncuesta($encuesta);

        return view('opciones.index', compact('encuesta', 'opciones'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Encuesta $encuesta)
    {
        return view('opciones.create', compact('encuesta'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOpcionEncuestaRequest $request, Encuesta $encuesta)
    {
        $data = $request->validated();
        $data['encuesta_id'] = $encuesta->id;

        $this->service->crear($data);

        return redirect()->route('opciones.index', $encuesta);
    }

    /**
     * Display the specified resource.
     */
    public function show(OpcionEncuesta $opcion)
    {
        $opcion->load(['usuario', 'encuesta', 'respuestas']);

        return view('opciones.show', compact('opcion'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OpcionEncuesta $opcion)
    {
        return view('opciones.edit', compact('opcion'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOpcionEncuestaRequest $request, OpcionEncuesta $opcion)
    {
        $this->service->actualizar($opcion, $request->validated());

        return redirect()->route('opciones.index', $opcion->encuesta_id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OpcionEncuesta $opcion)
    {
        $encuestaId = $opcion->encuesta_id;

        $opcion->delete();

        return redirect()->route('opciones.index', $encuestaId);
    }
}
