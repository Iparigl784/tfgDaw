<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Encuesta;
use App\Models\Reunion;

class EncuestaSeeder extends Seeder
{
    public function run(): void
    {
        Reunion::all()->each(function ($reunion) {
            Encuesta::factory()
                ->for($reunion, 'reunion')
                ->create();
        });
    }
}