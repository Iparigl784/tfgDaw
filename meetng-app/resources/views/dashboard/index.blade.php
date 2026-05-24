@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <h1>DASHBOARD</h1>
    <h2>Lista de Reuniones</h2>
    @include('reuniones._list')
    <p><a href="{{ route('reuniones.index') }}">Lista completa de reuniones</a></p>
    <p><a href="{{ route('encuestas.index') }}">Lista completa de encuestas</a></p>
@endsection