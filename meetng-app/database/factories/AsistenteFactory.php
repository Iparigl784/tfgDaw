<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Reunion;
use Illuminate\Database\Eloquent\Factories\Factory;

class AsistenteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'estado' => $this->faker->randomElement([
                'confirmado',
                'asistido',
                'no_asistido'
            ]),
            'reunion_id' => Reunion::factory(),
            'user_id' => User::factory(),
        ];
    }
}