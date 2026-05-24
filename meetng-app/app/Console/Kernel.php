<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Expirar encuestas cuya fecha límite ya pasó
        $schedule->command('encuestas:expirar')->everyMinute();

        // Cerrar encuestas automáticamente
        $schedule->command('encuestas:cerrar-encuestas')->everyMinute();

        // Actualizar estado de reuniones (realizada / cancelada)
        $schedule->command('reuniones:actualizar-estado')->everyMinute();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
