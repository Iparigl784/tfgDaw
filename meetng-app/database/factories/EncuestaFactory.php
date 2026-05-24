<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Reunion;
use Illuminate\Database\Eloquent\Factories\Factory;

class EncuestaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->sentence(4),
            'descripcion' => $this->faker->paragraph(),
            'tipo' => $this->faker->randomElement([
                'reunion',
                'generica'
            ]),
            'estado' => $this->faker->randomElement([
                'activa',
                'expirada'
            ]),
            'fecha_limite' => $this->faker->dateTimeBetween('now', '+1 month'),
            'reunion_id' => $this->faker->boolean(70) ? Reunion::factory() : null,
            'user_id' => User::factory(),
        ];
    }
}