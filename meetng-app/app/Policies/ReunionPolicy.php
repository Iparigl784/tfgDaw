<?php

namespace App\Policies;

use App\Models\Reunion;
use App\Models\User;

class ReunionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reunion $reunion): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $reunion->user_id ||
            $reunion->asistentes()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Reunion $reunion): bool
    {
        if (in_array($reunion->estado, ['pendiente_encuesta', 'cancelada', 'realizada'])) {
            return false;
        }

        return 
            $user->id === $reunion->user_id ||
            $user->rol->slug === 'admin';
    }

    public function delete(User $user, Reunion $reunion): bool
    {
        // Admin siempre puede eliminar
        if ($user->rol->slug === 'admin') {
            return true;
        }

        // Solo el creador puede eliminar
        if ($user->id !== $reunion->user_id) {
            return false;
        }

        // Si la reunión está realizada → NO permitir eliminar
        if (in_array($reunion->estado, ['pendiente_encuesta', 'realizada'])) {
            return false;
        }

        return true;
    }

    public function restore(User $user, Reunion $reunion): bool
    {
        return true;
    }

    public function forceDelete(User $user, Reunion $reunion): bool
    {
        return true;
    }

    public function verAsistentes(User $user, Reunion $reunion): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $reunion->user_id ||
            $reunion->asistentes()->where('user_id', $user->id)->exists();
    }

    public function añadirAsistente(User $user, Reunion $reunion): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $reunion->user_id;
    }

    public function eliminarAsistente(User $user, Reunion $reunion): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $reunion->user_id;
    }
}
