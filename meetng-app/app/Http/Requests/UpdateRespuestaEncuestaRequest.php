<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRespuestaEncuestaRequest extends FormRequest
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
            'opcion_encuesta_id' => 'required|exists:opcion_encuestas,id',
            'respuesta' => ['required', 'in:si,no'],
        ];
    }

    public function messages(): array
    {
        return [
            'opcion_encuesta_id.required' => 'La opción es obligatoria.',
            'opcion_encuesta_id.exists'   => 'La opción seleccionada no existe.',

            'respuesta.required'          => 'La respuesta es obligatoria.',
            'respuesta.in'                => 'La respuesta debe ser "si" o "no".',
        ];
    }
}
