<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Encuesta;
use Illuminate\Database\Eloquent\Factories\Factory;

class DestinatarioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'encuesta_id' => Encuesta::factory(),
            'user_id' => User::factory(),
        ];
    }
}