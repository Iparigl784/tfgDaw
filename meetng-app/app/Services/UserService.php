<?php

namespace App\Services;

use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function registrar(array $data): User
    {
        $rolUsuario = Rol::where('slug', 'user')->firstOrFail();

        return User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'rol_id'   => $rolUsuario->id,
        ]);
    }

    public function actualizar(User $user, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user->refresh();
    }

    public function cambiarPassword(User $user, array $data): User
    {
        if (!\Hash::check($data['current_password'], $user->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'current_password' => 'La contraseña actual no es correcta.',
            ]);
        }

        $user->password = \Hash::make($data['password']);
        $user->save();

        return $user;
    }

    public function cambiarRol(User $user, int $rolId): User
    {
        $user->rol_id = $rolId;
        $user->save();

        return $user;
    }
}