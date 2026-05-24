<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEncuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'        => 'sometimes|required|string|max:255',
            'descripcion'   => 'sometimes|required|string|max:500',
            'tipo'          => 'sometimes|string|in:reunion,generica',
            'estado'        => 'sometimes|string|in:activa,expirada,cerrada',
            'fecha_limite'  => 'sometimes|required|date|after:today',
            'reunion_id'    => 'sometimes|required|exists:reuniones,id',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required'      => 'El título es obligatorio.',
            'titulo.string'        => 'El título debe ser un texto válido.',
            'titulo.max'           => 'El título no puede superar los 255 caracteres.',

            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string'   => 'La descripción debe ser un texto válido.',
            'descripcion.max'      => 'La descripción no puede superar los 500 caracteres.',

            'tipo.string'          => 'El tipo debe ser un texto válido.',
            'tipo.in'              => 'El tipo debe ser "reunion" o "generica".',

            'estado.string'        => 'El estado debe ser un texto válido.',
            'estado.in'            => 'El estado debe ser "activa", "expirada" o "cerrada".',

            'fecha_limite.required' => 'La fecha límite es obligatoria.',
            'fecha_limite.date'     => 'La fecha límite debe ser una fecha válida.',
            'fecha_limite.after'    => 'La fecha límite debe ser posterior a hoy.',

            'reunion_id.required' => 'La reunión es obligatoria.',
            'reunion_id.exists'   => 'La reunión seleccionada no existe.',
        ];
    }
}
