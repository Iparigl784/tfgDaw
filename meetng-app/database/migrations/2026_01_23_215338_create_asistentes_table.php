<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('asistentes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email');
            $table->enum('estado', ['confirmado', 'asistido', 'no_asistido'])->default('confirmado');
            $table->foreignId('reunion_id')->nullable()->constrained('reuniones');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->timestamps();
            $table->unique(['reunion_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistentes');
    }
};
