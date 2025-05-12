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
    Schema::create('shifts', function (Blueprint $table) {
      $table->id();
      $table->enum('shift_type', ['A', 'B']);
      $table->date('date');
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('store_id');
      $table->enum('status', ['planned', 'completed', 'absent'])->default('planned');
      $table->timestamps();

      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('store_id')->references('id')->on('stores')->cascadeOnDelete();

      $table->unique(['user_id', 'date', 'shift_type']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('shifts');
  }
};
