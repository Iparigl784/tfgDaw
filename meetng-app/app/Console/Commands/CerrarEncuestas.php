<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Encuesta;
use App\Services\EncuestaService;

class CerrarEncuestas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'encuestas:cerrar-encuestas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cierra encuestas activas cuya fecha límite haya pasado y actualiza la reunión asociada';

    /**
     * Execute the console command.
     */
    public function handle(EncuestaService $encuestaService)
    {
        $encuestas = Encuesta::where('estado', 'activa')
            ->whereNotNull('fecha_limite')
            ->where('fecha_limite', '<=', now())
            ->get();

        $total = 0;

        foreach ($encuestas as $encuesta) {
            try {
                $encuestaService->cerrarEncuesta($encuesta);
                $total++;
            } catch (\Throwable $e) {
                $this->error("Error cerrando encuesta {$encuesta->id}: {$e->getMessage()}");
            }
        }

        $this->info("Encuestas cerradas automáticamente: {$total}");
    }
}
