<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use App\Enums\RoleSlug;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // User::factory()->create([
        //     'name' => 'admin',
        //     'email' => 'admin@admin.com',
        //     'password' => bcrypt('1234')
        // ]);

        // Sin cadenas mágicas, utilizamos la enumeración RoleSlug
        $administradorRole = Rol::where('slug', RoleSlug::ADMIN)->first();
        User::firstOrCreate(['name' => 'admin', 'email' => 'admin@admin.com', 'password' => bcrypt('1234'), 'rol_id' => $administradorRole->id]);
        
        // Sin cadenas mágicas, utilizamos la enumeración RoleSlug
        $usuarioRole = Rol::where('slug', RoleSlug::USER)->first();
        User::firstOrCreate(['name' => 'ivan', 'email' => 'ivan@ivan.com', 'password' => bcrypt('1234'), 'rol_id' => $usuarioRole->id]);
    }
}