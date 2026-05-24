<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReunionController;
use App\Http\Controllers\EncuestaController;
use App\Http\Controllers\OpcionEncuestaController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use Illuminate\Container\Attributes\Auth;

// Autenticación
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Home y páginas estáticas
Route::get('/', [HomeController::class, 'index'])->name('home.index');

Route::middleware('auth')->group(function () {
    // Rutas protegidas por autenticación
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
    Route::resource('reuniones', ReunionController::class)
     ->parameters(['reuniones' => 'reunion']);
    Route::resource('encuestas', EncuestaController::class)
     ->parameters(['encuestas' => 'encuesta']);
    Route::get('/encuestas/{encuesta}/opciones', [OpcionEncuestaController::class, 'index'])
    ->name('opciones.index');

});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::resource('usuarios', UserController::class);
});