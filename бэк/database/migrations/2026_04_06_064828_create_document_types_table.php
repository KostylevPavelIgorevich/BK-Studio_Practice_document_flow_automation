<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('gu12, gu27, gu2b, lu59');
            $table->string('name')->comment('Заявка на перевозку грузов ГУ-12');
            $table->string('html_template')->nullable()->comment('Путь к HTML шаблону');
            $table->json('fields_config')->nullable()->comment('JSON с конфигурацией полей');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
