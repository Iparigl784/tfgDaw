<ul>
    <p>
        <a href="{{ route('reuniones.create') }}">Crear reunión</a>
    </p>

    @foreach ($reuniones as $reunion)
        <li>
            {{ $reunion->titulo }} -
            {{ $reunion->estado }} -
            {{ $reunion->usuario->name ?? '' }} -

            <a href="{{ route('reuniones.show', $reunion->id) }}">Ver</a> -

            @can('update', $reunion)
                <a href="{{ route('reuniones.edit', $reunion->id) }}">Editar</a> -
            @endcan

            @can('delete', $reunion)
                <form method="POST"
                      action="{{ route('reuniones.destroy', $reunion->id) }}"
                      style="display: inline-block;">
                    @csrf
                    @method('DELETE')
                    <button type="submit"
                            onclick="return confirm('¿Seguro que deseas eliminar la reunión?')">
                        Eliminar
                    </button>
                </form>
            @endcan
        </li>
    @endforeach
</ul>