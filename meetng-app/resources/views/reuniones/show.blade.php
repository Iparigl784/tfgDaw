<h1>Ver reunión</h1>

<form method="POST" action="{{ route('reuniones.show', $reunion->id) }}">
    @csrf

    <input type="hidden" name="id" value="{{ htmlspecialchars($reunion->id) }}">

    <label>Título:</label><br>
    <input type="text"
           value="{{ htmlspecialchars($reunion->titulo) }}"
           disabled><br><br>

    <label>Descripción:</label><br>
    <textarea disabled>{{ htmlspecialchars($reunion->descripcion) }}</textarea><br><br>

    <label>Lugar:</label><br>
    <input type="text"
           value="{{ htmlspecialchars($reunion->lugar) }}"
           disabled><br><br>

    <label>Estado:</label><br>
    <input type="text"
           value="{{ ucfirst(str_replace('_',' ', $reunion->estado)) }}"
           disabled><br><br>

    <label>Organizador:</label><br>
    <select disabled>
        @foreach ($usuarios as $usuario)
            <option value="{{ $usuario->id }}"
                {{ $usuario->id == $reunion->user_id ? 'selected' : '' }}>
                {{ htmlspecialchars($usuario->name) }}
            </option>
        @endforeach
    </select><br><br>

    <label>Fecha inicio:</label><br>
    <input type="text"
           value="{{ \Carbon\Carbon::parse($reunion->fecha_inicio)->format('d/m/Y H:i') }}"
           disabled><br><br>

    <label>Fecha fin:</label><br>
    <input type="text"
           value="{{ \Carbon\Carbon::parse($reunion->fecha_fin)->format('d/m/Y H:i') }}"
           disabled><br><br>

</form>

<a href="{{ route('reuniones.index') }}">Volver</a>