<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ReunionService;

class ActualizarEstadoReuniones extends Command
{
    protected $signature = 'reuniones:actualizar-estado';

    protected $description = 'Actualiza el estado de reuniones cuya fecha_fin ya pasó';

    public function handle(ReunionService $service)
    {
        $procesadas = $service->procesarReunionesFinalizadas();
        $this->info("Reuniones procesadas: {$procesadas}");
    }

}