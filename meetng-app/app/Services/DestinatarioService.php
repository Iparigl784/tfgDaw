<?php

namespace App\Services;

use App\Models\Destinatario;
use App\Models\User;
use Illuminate\Support\Collection;

class DestinatarioService
{
    public function asignar(int $encuestaId, string $email): Destinatario
    {
        // Buscar usuario por email
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $email, 'password' => bcrypt('password')]
        );

        return Destinatario::firstOrCreate([
            'encuesta_id' => $encuestaId,
            'user_id'     => $user->id,
        ]);
    }

    public function asignarVarios(int $encuestaId, array $userIds): Collection
    {
        return collect($userIds)->map(function ($userId) use ($encuestaId) {
            return $this->asignar($encuestaId, $userId);
        });
    }

    public function eliminar(Destinatario $destinatario): bool
    {
        return (bool) $destinatario->delete();
    }

    public function syncDestinatarios(int $encuestaId, array $userIds)
    {
        // Elimina los que ya no están
        Destinatario::where('encuesta_id', $encuestaId)
            ->whereNotIn('user_id', $userIds)
            ->delete();

        // Añade los nuevos
        $destinatarios = collect($userIds)->map(function ($userId) use ($encuestaId) {
            return Destinatario::firstOrCreate([
                'encuesta_id' => $encuestaId,
                'user_id'     => $userId,
            ]);
        });

        return $destinatarios;
    }
}