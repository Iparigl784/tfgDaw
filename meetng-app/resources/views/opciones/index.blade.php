<h1>Opciones de la encuesta: {{ $encuesta->titulo }}</h1>

<ul>
@foreach($opciones as $opcion)
    <li>
        {{ \Carbon\Carbon::parse($opcion->fecha_inicio)->format('d/m/Y H:i') }}
        -
        {{ \Carbon\Carbon::parse($opcion->fecha_fin)->format('d/m/Y H:i') }}
        ({{ $opcion->estado }})
    </li>
@endforeach
</ul>

<a href="{{ route('encuestas.show', $encuesta) }}">Volver a la encuesta</a>
