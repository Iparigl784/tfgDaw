<h1>Ver Encuesta</h1>

<form method="POST" action="{{ route('encuestas.show', $encuesta->id) }}">
    @csrf

    <input type="hidden" name="id" value="{{ $encuesta->id }}">

    <label>Título:</label><br>
    <input type="text" value="{{ $encuesta->titulo }}" disabled><br><br>

    <label>Descripción:</label><br>
    <textarea disabled>{{ $encuesta->descripcion }}</textarea><br><br>

    <label>Tipo:</label><br>
    <input type="text" value="{{ ucfirst($encuesta->tipo) }}" disabled><br><br>

    <label>Estado:</label><br>
    <input type="text"
           value="{{ ucfirst(str_replace('_',' ', $encuesta->estado)) }}"
           disabled><br><br>

    <label>Fecha límite:</label><br>
    <input type="text"
           value="{{ $encuesta->fecha_limite }}"
           disabled><br><br>

    <label>Reunión asociada:</label><br>
    <input type="text"
           value="{{ $encuesta->reunion->titulo ?? 'Sin reunión' }}"
           disabled><br><br>

    <label>Usuario creador:</label><br>
    <input type="text"
           value="{{ $encuesta->usuario->name ?? '' }}"
           disabled><br><br>

<a href="{{ route('opciones.index', $encuesta) }}">Ver opciones de esta encuesta</a>

</form>

<a href="{{ route('encuestas.index') }}">Volver</a>
