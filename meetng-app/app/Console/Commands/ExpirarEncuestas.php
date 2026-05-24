<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Encuesta;
use App\Services\EncuestaService;

class ExpirarEncuestas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'encuestas:expirar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marca como expirada cualquier encuesta cuya fecha límite haya pasado';

    /**
     * Execute the console command.
     */
    public function handle(EncuestaService $encuestaService)
    {
        $expiradas = Encuesta::where('estado', 'activa')
            ->where('fecha_limite', '<', now())
            ->update(['estado' => 'expirada']);

        $this->info("Encuestas expiradas: {$expiradas}");
    }
}
