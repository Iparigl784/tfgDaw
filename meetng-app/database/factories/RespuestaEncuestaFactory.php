<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\OpcionEncuesta;
use Illuminate\Database\Eloquent\Factories\Factory;

class RespuestaEncuestaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'respuesta' => $this->faker->randomElement(['si', 'no']),
            'fecha_respuesta' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'opcion_encuesta_id' => OpcionEncuesta::factory(),
            'user_id' => User::factory(),
        ];
    }
}