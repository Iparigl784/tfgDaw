<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOpcionEncuestaRequest extends FormRequest
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
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin'    => 'sometimes|required|date|after:fecha_inicio',
            'estado'       => 'sometimes|required|in:pendiente,aceptada,rechazada',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date'     => 'La fecha de inicio debe ser válida.',

            'fecha_fin.required'    => 'La fecha de fin es obligatoria.',
            'fecha_fin.date'        => 'La fecha de fin debe ser válida.',
            'fecha_fin.after'       => 'La fecha de fin debe ser posterior a la fecha de inicio.',

            'estado.required'       => 'El estado es obligatorio.',
            'estado.in'             => 'El estado debe ser pendiente, aceptada o rechazada.',
        ];
    }
}
