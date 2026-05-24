<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            UserSeeder::class,
        ]);

        if (app() ->environment('local')) {
            $this->call([
                ReunionSeeder::class,
                EncuestaSeeder::class,
                OpcionEncuestaSeeder::class,
                AsistenteSeeder::class,
                DestinatarioSeeder::class,
                RespuestaEncuestaSeeder::class,
            ]);
        }
    }
}
