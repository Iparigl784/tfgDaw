<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
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
            'current_password' => ['required'],
            'password' => ['required', 'min:4', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'La contraseña actual es obligatoria.',

            'password.required'         => 'La nueva contraseña es obligatoria.',
            'password.min'              => 'La nueva contraseña debe tener al menos 4 caracteres.',
            'password.confirmed'        => 'La confirmación de la contraseña no coincide.',
        ];
    }
}
