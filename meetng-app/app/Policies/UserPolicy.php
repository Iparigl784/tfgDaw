<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function view(User $auth, User $user): bool
    {
        return $auth->rol->slug === 'admin' ||
            $auth->id === $user->id;
    }
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function update(User $auth, User $user): bool
    {
        return 
            $auth->rol->slug === 'admin' ||
            $auth->id === $user->id;
    }

    public function delete(User $auth): bool
    {
        return $auth->rol->slug === 'admin';
    }

    public function updatePassword(User $auth, User $user): bool
    {
        return $auth->rol->slug === 'admin' || $auth->id === $user->id;
    }

    public function updateRol(User $auth): bool
    {
        return $auth->rol->slug === 'admin';
    }
}
