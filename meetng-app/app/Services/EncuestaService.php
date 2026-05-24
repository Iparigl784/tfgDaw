<?php

namespace App\Services;

use App\Models\Asistente;
use App\Models\Reunion;
use App\Models\Encuesta;
use App\Models\OpcionEncuesta;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EncuestaService
{
    public function alta(array $data): Encuesta
    {
        return DB::transaction(function () use ($data) {

            $encuesta = Encuesta::create([
                'titulo'        => $data['titulo'],
                'descripcion'   => $data['descripcion'] ?? null,
                'tipo'          => $data['tipo'] ?? 'generica',
                'estado'        => 'activa',
                'fecha_limite'  => $data['fecha_limite'] ?? null,
                'reunion_id'    => $data['reunion_id'] ?? null,
                'user_id'       => Auth::id()
            ]);

            // Crear opciones si vienen
            if (!empty($data['opciones'])) {
                foreach ($data['opciones'] as $opcion) {
                    OpcionEncuesta::create([
                        'fecha_inicio' => $opcion['fecha_inicio'],
                        'fecha_fin'    => $opcion['fecha_fin'],
                        'estado'       => 'pendiente',
                        'encuesta_id'  => $encuesta->id,
                        'user_id'      => Auth::id()
                    ]);
                }
            }

            // Crear destinatarios si vienen emails
            if (!empty($data['destinatarios'])) {

                // Convertir emails → user_ids
                $userIds = User::whereIn('email', $data['destinatarios'])
                    ->pluck('id')
                    ->toArray();

                foreach ($userIds as $id) {
                    $encuesta->destinatarios()->create([
                        'user_id' => $id,
                        'estado'  => 'pendiente'
                    ]);
                }
            }

            return $encuesta->load(['opciones', 'destinatarios']);
        });
    }

    public function actualizar(Encuesta $encuesta, array $data): Encuesta
    {
        return DB::transaction(function () use ($encuesta, $data) {

            $encuesta->update([
                'titulo'        => $data['titulo']        ?? $encuesta->titulo,
                'descripcion'   => $data['descripcion']   ?? $encuesta->descripcion,
                'tipo'          => $data['tipo']          ?? $encuesta->tipo,
                'estado'        => $data['estado']        ?? $encuesta->estado,
                'fecha_limite'  => $data['fecha_limite']  ?? $encuesta->fecha_limite,
                'reunion_id'    => $data['reunion_id']    ?? $encuesta->reunion_id,
            ]);

            return $encuesta->refresh()->load('opciones');
        });
    }

    public function cerrarEncuesta(Encuesta $encuesta)
    {
        return DB::transaction(function () use ($encuesta) {

            // Obtener opción ganadora
            $opcionGanadora = $encuesta->opciones()
                ->withCount(['respuestas as votos_si' => fn($q) => $q->where('respuesta', 'si')])
                ->orderByDesc('votos_si')
                ->first();

            if (! $opcionGanadora) {
                throw new \RuntimeException('No hay opción ganadora para esta encuesta.');
            }

            // Marcar opciones como aceptada/rechazada
            foreach ($encuesta->opciones as $opcion) {
                $opcion->update([
                    'estado' => $opcion->id === $opcionGanadora->id ? 'aceptada' : 'rechazada'
                ]);
            }

            // Si NO hay reunión asociada → solo cerrar encuesta
            if (! $encuesta->reunion) {

                $encuesta->update([
                    'estado' => 'cerrada',
                    'opcion_ganadora_id' => $opcionGanadora->id,
                ]);

                return $encuesta->load(['opciones', 'destinatarios.usuario']);
            }

            // Si SÍ hay reunión → actualizarla
            $reunion = $encuesta->reunion;

            $reunion->update([
                'fecha_inicio'       => $opcionGanadora->fecha_inicio,
                'fecha_fin'          => $opcionGanadora->fecha_fin,
                'opcion_encuesta_id' => $opcionGanadora->id,
                'estado'             => 'programada',
            ]);

            // Crear asistentes confirmados
            $votantesIds = $opcionGanadora->respuestas()
                ->where('respuesta', 'si')
                ->pluck('user_id')
                ->unique();

            foreach ($votantesIds as $userId) {
                $user = User::find($userId);
                if (! $user) continue;

                Asistente::firstOrCreate(
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

            // Marcar encuesta como cerrada
            $encuesta->update([
                'estado' => 'cerrada',
                'opcion_ganadora_id' => $opcionGanadora->id,
            ]);

            return $reunion->load(['asistentes.usuario', 'opcion', 'encuesta']);
        });
    }

    public function getEncuestas(User $user, array $filters = [])
    {
        $q = Encuesta::query()
        ->delUsuario($user)
        ->orderBy('created_at', 'desc');

        if (!empty($filters['estado'])) {
            $q->where('estado', $filters['estado']);
        }

        if (!empty($filters['desde'])) {
            $q->where('created_at', '>=', $filters['desde']);
        }

        if (!empty($filters['hasta'])) {
            $q->where('fecha_limite', '<=', $filters['hasta']);
        }

        return $q;
    }
}