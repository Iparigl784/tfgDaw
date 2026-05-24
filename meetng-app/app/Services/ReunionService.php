<?php

namespace App\Services;

use App\Models\Reunion;
use App\Models\Encuesta;
use App\Models\User;
use App\Services\AsistenteService;
use App\Services\DestinatarioService;
use Illuminate\Support\Facades\Auth;
use App\Models\OpcionEncuesta;
use Illuminate\Support\Facades\DB;

class ReunionService
{
    public function alta(array $data): Reunion
    {
        return DB::transaction(function () use ($data) {

            $fechas = $data['fechas'];

            // CASO 1: Solo una fecha → reunión directa
            if (count($fechas) === 1) {

                $reunion = Reunion::create([
                    'titulo' => $data['titulo'],
                    'descripcion' => $data['descripcion'] ?? null,
                    'lugar' => $data['lugar'] ?? null,
                    'fecha_inicio' => $fechas[0]['fecha_inicio'],
                    'fecha_fin' => $fechas[0]['fecha_fin'],
                    'estado' => 'programada',
                    'user_id' => Auth::id()
                ]);

                // Crear asistentes manuales
                if (!empty($data['asistentes'])) {
                    foreach ($data['asistentes'] as $email) {
                        app(AsistenteService::class)->crear($reunion, $email);
                    }
                }

                return $reunion;
            }

            // CASO 2: Varias fechas → crear encuesta
            $reunion = Reunion::create([
                'titulo' => $data['titulo'],
                'descripcion' => $data['descripcion'] ?? null,
                'lugar' => $data['lugar'] ?? null,
                'estado' => 'pendiente_encuesta',
                'user_id' => Auth::id()
            ]);

            $encuesta = Encuesta::create([
                'titulo' => "Encuesta para reunión: {$reunion->titulo}",
                'descripcion' => $data['descripcion'] ?? null,
                'tipo' => 'reunion',
                'estado' => 'activa',
                'fecha_limite' => $data['fecha_limite'] ?? now()->addDays(3),
                'reunion_id' => $reunion->id,
                'user_id' => Auth::id()
            ]);

            foreach ($fechas as $fecha) {
                OpcionEncuesta::create([
                    'fecha_inicio' => $fecha['fecha_inicio'],
                    'fecha_fin' => $fecha['fecha_fin'],
                    'encuesta_id' => $encuesta->id,
                    'user_id' => Auth::id()
                ]);
            }

            // Crear destinatarios
            if (!empty($data['destinatarios'])) {
                foreach ($data['destinatarios'] as $email) {
                    app(DestinatarioService::class)->asignar($encuesta->id, $email);
                }
            }

            return $reunion;
        });
    }

    public function actualizar(Reunion $reunion, array $data): Reunion
    {
        return DB::transaction(function () use ($reunion, $data) {

            // Actualizar datos de la reunión
            $reunion->update([
                'titulo'       => $data['titulo'] ?? $reunion->titulo,
                'descripcion'  => $data['descripcion'] ?? $reunion->descripcion,
                'lugar'        => $data['lugar'] ?? $reunion->lugar,
                'fecha_inicio' => $data['fechas'][0]['fecha_inicio'] ?? $reunion->fecha_inicio,
                'fecha_fin'    => $data['fechas'][0]['fecha_fin'] ?? $reunion->fecha_fin,
            ]);

            return $reunion;
        });
    }

    public function procesarReunionesFinalizadas()
    {
        $reuniones = Reunion::finalizadasPendientes()->get();

        foreach ($reuniones as $reunion) {
            $this->procesarReunion($reunion);
        }

        return $reuniones->count();
    }

    public function procesarReunion(Reunion $reunion)
    {
        $confirmados = $reunion->asistentes()->where('estado', 'confirmado')->get();

        if ($confirmados->count() > 0) {
            $reunion->update(['estado' => 'realizada']);

            foreach ($confirmados as $asistente) {
                $asistente->update(['estado' => 'asistido']);
            }
        } else {
            $reunion->update(['estado' => 'cancelada']);

            foreach ($reunion->asistentes as $asistente) {
                $asistente->update(['estado' => 'no_asistido']);
            }
        }
    }

    public function getReuniones(User $user, array $filters = [])
    {
        $q = Reunion::query()
            ->delUsuario($user)
            ->ordenadas();

        if (!empty($filters['estado'])) {
            $q->where('estado', $filters['estado']);
        }

        if (!empty($filters['desde'])) {
            $q->where('fecha_inicio', '>=', $filters['desde']);
        }

        if (!empty($filters['hasta'])) {
            $q->where('fecha_fin', '<=', $filters['hasta']);
        }

        return $q; 
    }
}