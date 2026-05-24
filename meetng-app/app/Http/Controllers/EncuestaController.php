<?php

namespace App\Http\Controllers;

use App\Models\Encuesta;
use App\Models\User;
use App\Models\Reunion;
use App\Services\EncuestaService;
use App\Http\Requests\StoreEncuestaRequest;
use App\Http\Requests\UpdateEncuestaRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EncuestaController extends Controller
{
    use AuthorizesRequests;

    protected $encuestaService;

    public function __construct(EncuestaService $encuestaService)
    {
        $this->encuestaService = $encuestaService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        $encuestas = $this->encuestaService->getEncuestas($user);

        return view('encuestas.index', compact('encuestas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = User::all();
        $reuniones = Reunion::all();

        return view('encuestas.create', compact('usuarios', 'reuniones'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEncuestaRequest $request)
    {
        $this->encuestaService->alta($request->validated());

        return redirect()->route('encuestas.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Encuesta $encuesta)
    {
        $encuesta->load(['usuario', 'reunion', 'opciones', 'destinatarios']);

        return view('encuestas.show', compact('encuesta'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Encuesta $encuesta)
    {
        $this->authorize('update', $encuesta);

        $usuarios = User::all();
        $reuniones = Reunion::all();

        return view('encuestas.edit', compact('encuesta', 'usuarios', 'reuniones'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEncuestaRequest $request, Encuesta $encuesta)
    {
        $this->authorize('update', $encuesta);

        $this->encuestaService->actualizar($encuesta, $request->validated());

        return redirect()->route('encuestas.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Encuesta $encuesta)
    {
        $encuesta->delete();

        return redirect()->route('encuestas.index');
    }
}
