<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:4'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'El nombre es obligatorio.',
            'name.string'       => 'El nombre debe ser un texto válido.',
            'name.max'          => 'El nombre no puede superar los 255 caracteres.',

            'email.required'    => 'El email es obligatorio.',
            'email.email'       => 'El formato del email no es válido.',
            'email.unique'      => 'Este email ya está registrado.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.string'   => 'La contraseña debe ser un texto válido.',
            'password.min'      => 'La contraseña debe tener al menos 4 caracteres.',
        ];
    }
}
