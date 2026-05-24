<h1>Editar Reunión</h1>

<form action="{{ route('reuniones.update', $reunion) }}" method="POST">
    @csrf
    @method('PUT')

    <label>Título</label>
    <input type="text" name="titulo" value="{{ old('titulo', $reunion->titulo) }}">
    @error('titulo') <div class="error">{{ $message }}</div> @enderror


    <label>Descripción</label>
    <textarea name="descripcion">{{ old('descripcion', $reunion->descripcion) }}</textarea>


    <label>Lugar</label>
    <input type="text" name="lugar" value="{{ old('lugar', $reunion->lugar) }}">
    @error('lugar') <div class="error">{{ $message }}</div> @enderror


    <label>Estado</label>
    <select name="estado">
        @foreach(['pendiente_encuesta','programada', 'realizada', 'cancelada'] as $estado)
            <option value="{{ $estado }}"
                {{ old('estado', $reunion->estado) == $estado ? 'selected' : '' }}>
                {{ ucfirst(str_replace('_',' ',$estado)) }}
            </option>
        @endforeach
    </select>


    <label>Organizador</label>
    <select name="user_id">
        @foreach($usuarios as $u)
            <option value="{{ $u->id }}"
                {{ old('user_id', $reunion->user_id) == $u->id ? 'selected' : '' }}>
                {{ $u->name }}
            </option>
        @endforeach
    </select>

    <hr>
    <h3>Fechas propuestas</h3>

    <div id="fechas-container">

        @php
        $fechas = old('fechas', [
            [
                'fecha_inicio' => $reunion->fecha_inicio,
                'fecha_fin' => $reunion->fecha_fin,
            ]
        ]);
        @endphp

        @foreach($fechas as $index => $fecha)
            <div class="fecha-item">
                <hr>

                <label>Fecha inicio</label>
                <input type="datetime-local"
                       name="fechas[{{ $index }}][fecha_inicio]"
                       value="{{ isset($fecha['fecha_inicio']) 
                            ? \Carbon\Carbon::parse($fecha['fecha_inicio'])->format('Y-m-d\TH:i')
                            : '' }}">
                @error("fechas.$index.fecha_inicio")
                    <div class="error">{{ $message }}</div>
                @enderror


                <label>Fecha fin</label>
                <input type="datetime-local"
                       name="fechas[{{ $index }}][fecha_fin]"
                       value="{{ isset($fecha['fecha_fin']) 
                            ? \Carbon\Carbon::parse($fecha['fecha_fin'])->format('Y-m-d\TH:i')
                            : '' }}">
                @error("fechas.$index.fecha_fin")
                    <div class="error">{{ $message }}</div>
                @enderror


                <button type="button" onclick="this.parentElement.remove()">
                    Eliminar
                </button>
            </div>
        @endforeach

    </div>

    @error('fechas')
        <div class="error">{{ $message }}</div>
    @enderror

    <button type="button" onclick="agregarFecha()">Agregar otra fecha</button>

    <br><br>
    <button type="submit">Actualizar</button>
</form>

<a href="{{ route('reuniones.index') }}">Volver</a>

<script>
let index = {{ count($fechas) }};

function agregarFecha() {

    const container = document.getElementById('fechas-container');

    const div = document.createElement('div');
    div.classList.add('fecha-item');

    div.innerHTML = `
        <hr>

        <label>Fecha inicio</label>
        <input type="datetime-local" name="fechas[${index}][fecha_inicio]">

        <label>Fecha fin</label>
        <input type="datetime-local" name="fechas[${index}][fecha_fin]">

        <button type="button" onclick="this.parentElement.remove()">
            Eliminar
        </button>
    `;

    container.appendChild(div);
    index++;
}
</script>