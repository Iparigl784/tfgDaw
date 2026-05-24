<ul>
    <p>
        <a href="{{ route('encuestas.create') }}">Crear encuesta</a>
    </p>

    @foreach ($encuestas as $encuesta)
        <li>
            {{ $encuesta->titulo }} -
            {{ $encuesta->estado }} -
            {{ $encuesta->usuario->name ?? '' }} -

            <a href="{{ route('encuestas.show', $encuesta->id) }}">Ver</a> -

            @can('update', $encuesta)
                <a href="{{ route('encuestas.edit', $encuesta->id) }}">Editar</a> -
            @endcan

            @can('delete', $encuesta)
                <form method="POST"
                      action="{{ route('encuestas.destroy', $encuesta->id) }}"
                      style="display: inline-block;">
                    @csrf
                    @method('DELETE')
                    <button type="submit"
                            onclick="return confirm('¿Seguro que deseas eliminar la encuesta?')">
                        Eliminar
                    </button>
                </form>
            @endcan
        </li>
    @endforeach

    <p>
        <a href="{{ route('dashboard.index') }}">Volver al dashboard</a>
    </p>
</ul>