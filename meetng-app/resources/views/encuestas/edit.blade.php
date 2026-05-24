<h1>Editar Encuesta</h1>

<form action="{{ route('encuestas.update', $encuesta) }}" method="POST">
    @csrf
    @method('PUT')

    <label>Título</label>
    <input type="text" name="titulo" value="{{ old('titulo', $encuesta->titulo) }}">
    @error('titulo') <div class="error">{{ $message }}</div> @enderror

    <label>Descripción</label>
    <textarea name="descripcion">{{ old('descripcion', $encuesta->descripcion) }}</textarea>
    @error('descripcion') <div class="error">{{ $message }}</div> @enderror

    <label>Tipo</label>
    <select name="tipo">
        @foreach(['reunion', 'generica'] as $tipo)
            <option value="{{ $tipo }}"
                {{ old('tipo', $encuesta->tipo) == $tipo ? 'selected' : '' }}>
                {{ ucfirst($tipo) }}
            </option>
        @endforeach
    </select>

    <label>Estado</label>
    <select name="estado">
        @foreach(['activa', 'expirada'] as $estado)
            <option value="{{ $estado }}"
                {{ old('estado', $encuesta->estado) == $estado ? 'selected' : '' }}>
                {{ ucfirst(str_replace('_',' ',$estado)) }}
            </option>
        @endforeach
    </select>

    <label>Fecha límite</label>
    <input type="datetime-local" name="fecha_limite"
       value="{{ old('fecha_limite', \Carbon\Carbon::parse($encuesta->fecha_limite)->format('Y-m-d H:i')) }}">
    @error('fecha_limite') <div class="error">{{ $message }}</div> @enderror

    <label>Reunión asociada</label>
    <select name="reunion_id">
        @foreach($reuniones as $r)
            <option value="{{ $r->id }}"
                {{ old('reunion_id', $encuesta->reunion_id) == $r->id ? 'selected' : '' }}>
                {{ $r->titulo }}
            </option>
        @endforeach
    </select>

    <label>Usuario creador</label>
    <select name="user_id">
        @foreach($usuarios as $u)
            <option value="{{ $u->id }}"
                {{ old('user_id', $encuesta->user_id) == $u->id ? 'selected' : '' }}>
                {{ $u->name }}
            </option>
        @endforeach
    </select>

    <br><br>
    <button type="submit">Actualizar</button>
</form>

<a href="{{ route('encuestas.index') }}">Volver</a>
