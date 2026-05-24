<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Encuesta;
use App\Models\User;
use App\Models\Destinatario;

class DestinatarioSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = User::take(3)->get();

        Encuesta::all()->each(function ($encuesta) use ($usuarios) {
            $usuarios->random(2)->each(function ($user) use ($encuesta) {
                Destinatario::factory()->create([
                    'encuesta_id' => $encuesta->id,
                    'user_id' => $user->id,
                ]);
            });
        });
    }
}