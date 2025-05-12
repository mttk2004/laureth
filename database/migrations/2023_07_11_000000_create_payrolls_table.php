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
    Schema::create('payrolls', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('user_id');
      $table->integer('month');
      $table->integer('year');
      $table->decimal('base_amount', 10, 2);
      $table->decimal('total_hours', 6, 2)->default(0);
      $table->decimal('commission_amount', 10, 2)->default(0);
      $table->decimal('final_amount', 12, 2);
      $table->enum('status', ['pending', 'paid'])->default('pending');
      $table->timestamps();

      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

      $table->unique(['user_id', 'month', 'year']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('payrolls');
  }
};
