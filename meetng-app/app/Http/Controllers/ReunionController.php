<?php

namespace App\Http\Controllers;

use App\Services\ReunionService;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\OpcionEncuesta;
use App\Models\Reunion;
use Illuminate\Http\Request;
use App\Http\Requests\StoreReunionRequest;
use App\Http\Requests\UpdateReunionRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReunionController extends Controller
{
    use AuthorizesRequests;
    protected  $reunionService;

    public function __construct(
        ReunionService $reunionService
    ) {
        $this->reunionService = $reunionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        // Si quieres todas las reuniones del usuario o todas si es admin
        $reuniones = $this->reunionService->getReuniones($user);

        return view('reuniones.index', compact('reuniones'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = User::all();
        return view('reuniones.create', compact('usuarios'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReunionRequest $request)
    {
        $reunion = $this->reunionService->alta(
            $request->validated()
        );

        return redirect()->route('reuniones.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Reunion $reunion)
    {
        $usuarios = User::all();
        return view('reuniones.show', compact('usuarios', 'reunion'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reunion $reunion)
    {
        $this->authorize('update', $reunion);

        $usuarios = User::all();

        return view('reuniones.edit', compact('usuarios', 'reunion'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReunionRequest $request, Reunion $reunion)
    {
        $this->authorize('update', $reunion);

        $this->reunionService->actualizar(
            $reunion,
            $request->validated()
        );

        return redirect()->route('reuniones.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reunion $reunion)
    {
        $reunion->delete();
        return redirect()->route('reuniones.index');
    }
}