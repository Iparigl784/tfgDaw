<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reunion;
use App\Services\ReunionService;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    protected $reunionService;

    public function __construct(
        ReunionService $reunionService
    ) {
        // Inyección de dependencias en el constructor (para no tener que hacerlo en cada método)
        $this->reunionService = $reunionService;
    }

    public function index()
    {
        $user = Auth::user();
        $reuniones = $this->reunionService->getReuniones($user, 5);

        return view("dashboard.index", compact("reuniones"));
    }
}