<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name'  => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $this->user->id],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'El nombre debe ser un texto válido.',
            'name.max'    => 'El nombre no puede superar los 255 caracteres.',

            'email.email'  => 'El formato del email no es válido.',
            'email.unique' => 'Este email ya está registrado.',
        ];
    }
}
