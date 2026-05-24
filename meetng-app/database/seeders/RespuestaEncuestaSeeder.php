<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OpcionEncuesta;
use App\Models\User;
use App\Models\RespuestaEncuesta;

class RespuestaEncuestaSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = User::take(5)->get();

        OpcionEncuesta::all()->each(function ($opcion) use ($usuarios) {
            $usuarios->random(4)->each(function ($user) use ($opcion) {
                RespuestaEncuesta::factory()->create([
                    'opcion_encuesta_id' => $opcion->id,
                    'user_id' => $user->id,
                ]);
            });
        });
    }
}