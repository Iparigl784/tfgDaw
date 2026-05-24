<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Encuesta;
use App\Models\OpcionEncuesta;

class OpcionEncuestaSeeder extends Seeder
{
    public function run(): void
    {
        Encuesta::all()->each(function ($encuesta) {
            OpcionEncuesta::factory(3)
                ->for($encuesta, 'encuesta')
                ->create();
        });
    }
}