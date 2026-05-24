<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reunion;

class ReunionSeeder extends Seeder
{
    public function run(): void
    {
        Reunion::factory(5)->create();
    }
}