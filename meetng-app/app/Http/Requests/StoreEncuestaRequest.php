<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEncuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'        => 'required|string|max:255',
            'descripcion'   => 'required|string|max:500',
            'tipo'          => 'sometimes|string|in:reunion,generica',
            'fecha_limite'  => 'required|date|after:today',

            // opciones
            'opciones'                      => 'sometimes|array|min:1',
            'opciones.*.fecha_inicio'       => 'required_with:opciones|date',
            'opciones.*.fecha_fin'          => 'required_with:opciones|date|after:opciones.*.fecha_inicio',

            'reunion_id'    => 'sometimes|required|exists:reuniones,id',

            // destinatarios por email
            'destinatarios'      => 'sometimes|array',
            'destinatarios.*'    => 'email|exists:users,email',
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

            'fecha_limite.required' => 'La fecha límite es obligatoria.',
            'fecha_limite.date'     => 'La fecha límite debe ser una fecha válida.',
            'fecha_limite.after'    => 'La fecha límite debe ser posterior a hoy.',

            'opciones.array'        => 'Las opciones deben enviarse en formato de lista.',
            'opciones.min'          => 'Debes incluir al menos una opción.',

            'opciones.*.fecha_inicio.required_with' => 'La fecha de inicio es obligatoria para cada opción.',
            'opciones.*.fecha_inicio.date'          => 'La fecha de inicio debe ser válida.',

            'opciones.*.fecha_fin.required_with'    => 'La fecha de fin es obligatoria para cada opción.',
            'opciones.*.fecha_fin.date'             => 'La fecha de fin debe ser válida.',
            'opciones.*.fecha_fin.after'            => 'La fecha de fin debe ser posterior a la fecha de inicio.',

            'reunion_id.required' => 'La reunión es obligatoria cuando el tipo es "reunion".',
            'reunion_id.exists'   => 'La reunión seleccionada no existe.',
        ];
    }
}