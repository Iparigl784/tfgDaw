<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReunionController;
use App\Http\Controllers\Api\EncuestaController;
use App\Http\Controllers\Api\OpcionEncuestaController;
use App\Http\Controllers\Api\RespuestaEncuestaController;
use App\Http\Controllers\Api\DestinatarioController;
use App\Http\Controllers\Api\AsistenteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InvitacionController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [UserController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/usuarios', [UserController::class, 'index']);
    Route::put('/usuarios/{user}', [UserController::class, 'update']);
    Route::get('/usuarios/{user}', [UserController::class, 'show']);
    Route::put('/usuarios/{user}/password', [UserController::class, 'updatePassword']);
    Route::put('/usuarios/{user}/rol', [UserController::class, 'updateRol']);
    Route::delete('/usuarios/{user}', [UserController::class, 'destroy']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/reuniones', [ReunionController::class, 'index']);
    Route::post('/reuniones', [ReunionController::class, 'store']);
    Route::get('/reuniones/{reunion}', [ReunionController::class, 'show']);
    Route::put('/reuniones/{reunion}', [ReunionController::class, 'update']);
    Route::delete('/reuniones/{reunion}', [ReunionController::class, 'destroy']);
    Route::get('/mis-reuniones', [ReunionController::class, 'misReuniones']);
    Route::get('/mis-asistencias', [ReunionController::class, 'misAsistencias']);

    Route::get('/invitaciones', [InvitacionController::class, 'index']);

    Route::get('/encuestas', [EncuestaController::class, 'index']);
    Route::post('/encuestas', [EncuestaController::class, 'store']);
    Route::get('/encuestas/{encuesta}', [EncuestaController::class, 'show']);
    Route::put('/encuestas/{encuesta}', [EncuestaController::class, 'update']);
    Route::delete('/encuestas/{encuesta}', [EncuestaController::class, 'destroy']);
    Route::post('/encuestas/{encuesta}/cerrar', [EncuestaController::class, 'cerrar']);
    Route::get('/mis-encuestas', [EncuestaController::class, 'misEncuestas']);

    Route::get('/encuestas/{encuesta}/opciones', [OpcionEncuestaController::class, 'index']);

    Route::get('/encuestas/{encuesta}/votos', [RespuestaEncuestaController::class, 'index']);
    Route::post('/encuestas/{encuesta}/votos', [RespuestaEncuestaController::class, 'store']);
    Route::put('/encuestas/{encuesta}/votos', [RespuestaEncuestaController::class, 'update']);
    Route::get('/encuestas/{encuesta}/mis-votos', [RespuestaEncuestaController::class, 'misVotos']);
    Route::get('/encuestas/{encuesta}/resultados', [RespuestaEncuestaController::class, 'resultados']);

    Route::get('/encuestas/{encuesta}/destinatarios', [DestinatarioController::class, 'index']);
    Route::post('/encuestas/{encuesta}/destinatarios', [DestinatarioController::class, 'store']);
    Route::put('/encuestas/{encuesta}/destinatarios', [DestinatarioController::class, 'update']);
    Route::delete('/encuestas/{encuesta}/destinatarios/{destinatario}', [DestinatarioController::class, 'destroy']);

    Route::get('/reuniones/{reunion}/asistentes', [AsistenteController::class, 'index']);
    Route::post('/reuniones/{reunion}/asistentes', [AsistenteController::class, 'store']);
    Route::put('/asistentes/{asistente}', [AsistenteController::class, 'update']);
    Route::delete('/reuniones/{reunion}/asistentes/{asistente}', [AsistenteController::class, 'destroy']);
    Route::post('/asistentes/{asistente}/confirmar', [AsistenteController::class, 'confirmar']);
    Route::post('/asistentes/{asistente}/rechazar', [AsistenteController::class, 'rechazar']);
});
