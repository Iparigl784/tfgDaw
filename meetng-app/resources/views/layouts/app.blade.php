<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>@yield('title')</title>
</head>
<body>

<header>
    <h2>Gestor de Reuniones</h2>
    <strong>
        Usuario: {{ Auth::user()->name }}
    </strong>
    <form method="POST" action="{{ route('logout') }}" style="display:inline;">
        @csrf
        <button type="submit">Logout</button>
    </form>
</header>

<hr>

<main>
    @yield('content')
</main>

</body>
</html>