<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asistente;
use App\Models\Reunion;
use App\Models\User;

class AsistenteSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = User::all();

        foreach (Reunion::all() as $reunion) {

            // Tomamos exactamente 3 usuarios distintos
            $usuarios->random(3)->each(function ($user) use ($reunion) {

                Asistente::factory()->create([
                    'nombre' => $user->name,
                    'email' => $user->email, // evita conflicto con unique()
                    'reunion_id' => $reunion->id,
                    'user_id' => $user->id,
                ]);

            });
        }
    }
}