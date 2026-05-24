<?php

namespace App\Policies;

use App\Models\Encuesta;
use App\Models\User;

class EncuestaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Encuesta $encuesta): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $encuesta->user_id ||
            $encuesta->destinatarios()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Encuesta $encuesta): bool
    {
        if (in_array($encuesta->estado, ['cerrada', 'expirada'])) {
            return false;
        }

        return $user->id === $encuesta->user_id
            || $user->rol->slug === 'admin';
    }

    public function delete(User $user, Encuesta $encuesta): bool
    {
        // Admin siempre puede eliminar
        if ($user->rol->slug === 'admin') {
            return true;
        }

        // Solo el creador puede eliminar
        if ($user->id !== $encuesta->user_id) {
            return false;
        }

        // Si faltan menos de 24h → NO permitir eliminar
        $faltanMenosDe24h = now()->diffInHours($encuesta->fecha_limite, false) < 24;

        if ($faltanMenosDe24h) {
            return false;
        }

        return true;
    }

    public function restore(User $user, Encuesta $encuesta): bool
    {
        return true;
    }

    public function forceDelete(User $user, Encuesta $encuesta): bool
    {
        return true;
    }

    /**
     * QUIÉN PUEDE VOTAR
     * - Admin
     * - Creador
     * - Destinatarios (solo si la encuesta está activa)
     */
    public function votar(User $user, Encuesta $encuesta): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $encuesta->user_id ||
            (
                $encuesta->estado === 'activa' &&
                $encuesta->destinatarios()->where('user_id', $user->id)->exists()
            );
    }

    /**
     * VER TODOS LOS VOTOS
     * - Admin
     * - Creador
     */
    public function verVotos(User $user, Encuesta $encuesta): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $encuesta->user_id;
    }

    /**
     * VER MIS VOTOS
     * - Creador y destinatarios
     */
    public function verMisVotos(User $user, Encuesta $encuesta): bool
    {
        return 
            $user->id === $encuesta->user_id || // ← AÑADIR ESTO
            $encuesta->destinatarios()->where('user_id', $user->id)->exists();
    }


    /**
     * VER RESULTADOS
     * - Admin
     * - Creador
     * - Destinatarios
     */
    public function verResultados(User $user, Encuesta $encuesta): bool
    {
        return 
            $user->rol->slug === 'admin' ||
            $user->id === $encuesta->user_id ||
            $encuesta->destinatarios()->where('user_id', $user->id)->exists();
    }

    public function asignarDestinatarios(User $user, Encuesta $encuesta): bool
    {
        if ($encuesta->estado === 'cerrada') {
            return false;
        }

        return $user->id === $encuesta->user_id
            || $user->rol->slug === 'admin';
    }

    public function cerrar(User $user, Encuesta $encuesta): bool
    {
        if (in_array($encuesta->estado, ['cerrada', 'expirada'])) {
            return false;
        }

        return $user->id === $encuesta->user_id
            || $user->rol->slug === 'admin';
    }
}