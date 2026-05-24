<?php

namespace App\Services;

use App\Models\Asistente;
use App\Models\Reunion;
use App\Models\User;

class AsistenteService
{
    public function lista(Reunion $reunion)
    {
        return $reunion->asistentes()
            ->with('usuario')
            ->orderBy('nombre')
            ->get();
    }

    public function crear(Reunion $reunion, string $email)
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $email, 'password' => bcrypt('password')]
        );

        return Asistente::firstOrCreate(
            [
                'reunion_id' => $reunion->id,
                'user_id'    => $user->id,
            ],
            [
                'estado' => 'pendiente',
                'nombre' => $user->name,
                'email'  => $user->email,
            ]
        );
    }


    public function crearConfirmado(Reunion $reunion, int $userId)
    {
        $user = User::findOrFail($userId);

        return Asistente::firstOrCreate(
            [
                'reunion_id' => $reunion->id,
                'user_id'    => $user->id,
            ],
            [
                'estado' => 'confirmado',
                'nombre' => $user->name,
                'email'  => $user->email,
            ]
        );
    }

    public function actualizarEstado(Asistente $asistente, string $estado)
    {
        $asistente->update(['estado' => $estado]);
        return $asistente;
    }

    public function eliminar(Asistente $asistente)
    {
        return $asistente->delete();
    }

    public function confirmar(Asistente $asistente)
    {
        return $this->actualizarEstado($asistente, 'confirmado');
    }

    public function rechazar(Asistente $asistente)
    {
        return $this->actualizarEstado($asistente, 'no_asistido');
    }
}