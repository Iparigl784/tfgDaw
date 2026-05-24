@extends('layouts.main')

@section('title', 'Inicio de sesión')

@section('content')
    <h1>Iniciar sesión</h1>
    <form method='POST' action="{{ route('login') }}">
        @csrf
    <input type='email' name='email' placeholder='E-mail'>
    <input type='password' name='password' placeholder='Password'>
    <button type='submit'>Acceder</button>
    </form>

    @if ($errors->any())
        <div style="color:red;">
            {{ $errors->first() }}
        </div>
    @endif
@endsection