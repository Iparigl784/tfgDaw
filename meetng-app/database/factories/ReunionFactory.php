<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\OpcionEncuesta;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReunionFactory extends Factory
{
    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('now', '+1 month');
        $fechaFin = (clone $fechaInicio)->modify('+2 hours');

        return [
            'titulo' => $this->faker->sentence(3),
            'descripcion' => $this->faker->paragraph(),
            'lugar' => $this->faker->address(),
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'estado' => $this->faker->randomElement([
                'pendiente_encuesta',
                'programada',
                'realizada',
                'cancelada'
            ]),
            'opcion_encuesta_id' => null, // normalmente se asigna después
            'user_id' => User::factory(),
        ];
    }
}