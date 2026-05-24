<h1>Crear Reunión</h1>

<form action="{{ route('reuniones.store') }}" method="POST">
    @csrf

    <label>Título</label>
    <input type="text" name="titulo" value="{{ old('titulo') }}">
    @error('titulo') <div class="error">{{ $message }}</div> @enderror


    <label>Descripción</label>
    <textarea name="descripcion">{{ old('descripcion') }}</textarea>
    @error('descripcion') <div class="error">{{ $message }}</div> @enderror


    <label>Lugar</label>
    <input type="text" name="lugar" value="{{ old('lugar') }}">
    @error('lugar') <div class="error">{{ $message }}</div> @enderror


    <label>Estado</label>
    <select name="estado">
        <option value="programada" {{ old('estado') == 'programada' ? 'selected' : '' }}>Programada</option>
        <option value="pendiente_encuesta" {{ old('estado') == 'pendiente_encuesta' ? 'selected' : '' }}>Pendiente encuesta</option>
        <option value="cancelada" {{ old('estado') == 'cancelada' ? 'selected' : '' }}>Cancelada</option>
    </select>
    @error('estado') <div class="error">{{ $message }}</div> @enderror

    <hr>
    <h3>Fechas propuestas</h3>

    <div id="fechas-container">
        <div class="fecha-item">
            <label>Fecha inicio</label>
            <input type="datetime-local" name="fechas[0][fecha_inicio]">

            <label>Fecha fin</label>
            <input type="datetime-local" name="fechas[0][fecha_fin]">
        </div>
    </div>

    <button type="button" onclick="agregarFecha()">Agregar otra fecha</button>

    <br><br>
    <button type="submit">Crear</button>
</form>

<a href="{{ route('reuniones.index') }}">Volver</a>

<script>
let index = 1;

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

        <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
    `;

    container.appendChild(div);
    index++;
}
</script>