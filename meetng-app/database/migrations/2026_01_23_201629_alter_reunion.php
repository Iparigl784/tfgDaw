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
        // Reutilizamos la tabla reuniones para añadir la relación con opciones de encuesta
        Schema::table('reuniones', function (Blueprint $table) {
            $table->foreignId('opcion_encuesta_id')->nullable()->constrained('opcion_encuestas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reuniones', function (Blueprint $table) {
            $table->dropForeign(['opcion_encuesta_id']);
            $table->dropColumn('opcion_encuesta_id');
        });
    }
};
