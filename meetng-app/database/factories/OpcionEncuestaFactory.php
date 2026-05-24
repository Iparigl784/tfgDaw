<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Encuesta;
use Illuminate\Database\Eloquent\Factories\Factory;

class OpcionEncuestaFactory extends Factory
{
    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('now', '+1 month');
        $fechaFin = (clone $fechaInicio)->modify('+2 hours');

        return [
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'estado' => $this->faker->randomElement([
                'pendiente',
                'aceptada',
                'rechazada'
            ]),
            'encuesta_id' => Encuesta::factory(),
            'user_id' => User::factory(),
        ];
    }
}