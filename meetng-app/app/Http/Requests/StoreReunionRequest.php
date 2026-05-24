<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReunionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Si quieres asegurar formato uniforme puedes transformarlo aquí
        // $this->merge([...]);
    }

    public function rules(): array
    {
        return [
            'titulo' => ['bail', 'required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'lugar' => ['nullable', 'string', 'max:255'],
            'estado' => ['sometimes', Rule::in(['pendiente_encuesta', 'programada','cancelada'])],

            // Debe existir el array
            'fechas' => ['required', 'array', 'min:1'],

            // Cada elemento debe ser un array válido
            'fechas.*' => ['required', 'array'],

            // Validaciones internas
            'fechas.*.fecha_inicio' => [
                'bail',
                'required',
                'date',
                'after:now'
            ],

            'fechas.*.fecha_fin' => [
                'bail',
                'required',
                'date',
                'after:fechas.*.fecha_inicio'
            ],

            // Asistentes por email
            'asistentes' => ['sometimes', 'array'],
            'asistentes.*' => ['email', 'exists:users,email'],

            // Destinatarios por email
            'destinatarios'   => ['sometimes', 'array'],
            'destinatarios.*' => ['email'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'titulo.max' => 'El título no puede superar los 255 caracteres.',

            'descripcion.max' => 'La descripción no puede superar los 2000 caracteres.',

            'fechas.required' => 'Debe seleccionar al menos una fecha.',
            'fechas.array' => 'El formato de las fechas no es válido.',
            'fechas.min' => 'Debe haber al menos una fecha.',

            'fechas.*.fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fechas.*.fecha_inicio.after' => 'La fecha de inicio debe ser futura.',

            'fechas.*.fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fechas.*.fecha_fin.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
        ];
    }
}