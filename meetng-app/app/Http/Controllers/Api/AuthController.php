<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credenciales = $request->only('email', 'password');

        // Busca el usuario y lo autentica
        if (Auth::attempt($credenciales)) {
            $user = Auth::user();
            /** @var \App\Models\User $user */
            $token = $user->createToken('api-token')->plainTextToken;
            return response()->json(['token' => $token]);
        } else {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

}