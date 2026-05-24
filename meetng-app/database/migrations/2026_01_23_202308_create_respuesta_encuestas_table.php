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
        Schema::create('respuesta_encuestas', function (Blueprint $table) {
            $table->id();
            $table->enum('respuesta', ['si','no']);
            $table->date('fecha_respuesta');
            $table->foreignId('opcion_encuesta_id')->nullable()->constrained('opcion_encuestas');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->timestamps();
            $table->unique(['opcion_encuesta_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respuesta_encuestas');
    }
};
