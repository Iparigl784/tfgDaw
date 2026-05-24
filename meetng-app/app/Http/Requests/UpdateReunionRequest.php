<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReunionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['bail', 'required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'lugar' => ['nullable', 'string', 'max:255'],
            'estado' => ['sometimes', Rule::in(['pendiente_encuesta', 'programada', 'realizada', 'cancelada'])],
            'user_id' => ['sometimes', 'exists:users,id'],

            // Solo permitimos una fecha en edición
            'fechas' => ['required', 'array', 'size:1'],

            // Reglas específicas para la primera fecha
            'fechas.0.fecha_inicio' => ['bail', 'required', 'date', 'after_or_equal:now'],
            'fechas.0.fecha_fin' => ['bail', 'required', 'date', 'after:fechas.0.fecha_inicio'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'titulo.max' => 'El título no puede superar los 150 caracteres.',

            'descripcion.max' => 'La descripción no puede superar los 200 caracteres.',
            'lugar.max' => 'El lugar no puede superar los 255 caracteres.',

            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado seleccionado no es válido.',

            'user_id.required' => 'Debe seleccionar un organizador.',
            'user_id.exists' => 'El organizador seleccionado no existe.',

            'fechas.required' => 'Debe introducir al menos una fecha.',
            'fechas.array' => 'Formato de fechas inválido.',
            'fechas.size' => 'Solo se puede modificar una fecha en la edición.',

            'fechas.0.fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fechas.0.fecha_inicio.date' => 'Formato de fecha de inicio inválido.',
            'fechas.0.fecha_inicio.after_or_equal' => 'La fecha de inicio debe ser hoy o futura.',

            'fechas.0.fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fechas.0.fecha_fin.date' => 'Formato de fecha de fin inválido.',
            'fechas.0.fecha_fin.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
        ];
    }
}