<?php

namespace App\Policies;

use App\Models\Asistente;
use App\Models\User;

class AsistentePolicy
{
    public function responderInvitacion(User $user, Asistente $asistente): bool
    {
        return 
            $user->id === $asistente->user_id ||
            $user->id === $asistente->reunion->user_id ||
            $user->rol->slug === 'admin';
    }

    public function modificarAsistente(User $user, Asistente $asistente): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $asistente->reunion->user_id;
    }

    public function eliminarAsistente(User $user, Asistente $asistente): bool
    {
        if (in_array($asistente->reunion->estado, ['cancelada', 'realizada'])) {
            return false;
        }

        return 
            $user->rol->slug === 'admin' ||
            $user->id === $asistente->reunion->user_id;
    }
}