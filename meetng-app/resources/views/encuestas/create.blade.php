<h1>Crear Encuesta</h1>

<form action="{{ route('encuestas.store') }}" method="POST">
    @csrf

    <label>Título</label>
    <input type="text" name="titulo" value="{{ old('titulo') }}">
    @error('titulo') <div class="error">{{ $message }}</div> @enderror

    <label>Descripción</label>
    <textarea name="descripcion">{{ old('descripcion') }}</textarea>
    @error('descripcion') <div class="error">{{ $message }}</div> @enderror

    <label>Tipo</label>
    <select name="tipo">
        <option value="reunion" {{ old('tipo') == 'reunion' ? 'selected' : '' }}>Reunión</option>
        <option value="generica" {{ old('tipo') == 'generica' ? 'selected' : '' }}>Genérica</option>
    </select>
    @error('tipo') <div class="error">{{ $message }}</div> @enderror

    <label>Fecha límite</label>
    <input type="date" name="fecha_limite" value="{{ old('fecha_limite') }}">
    @error('fecha_limite') <div class="error">{{ $message }}</div> @enderror

    <label>Reunión asociada</label>
    <select name="reunion_id">
        @foreach($reuniones as $r)
            <option value="{{ $r->id }}"
                {{ old('reunion_id') == $r->id ? 'selected' : '' }}>
                {{ $r->titulo }}
            </option>
        @endforeach
    </select>
    @error('reunion_id') <div class="error">{{ $message }}</div> @enderror

    <br><br>
    <button type="submit">Crear</button>
</form>

<a href="{{ route('encuestas.index') }}">Volver</a>
