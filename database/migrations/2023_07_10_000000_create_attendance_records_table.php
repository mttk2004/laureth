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
    Schema::create('attendance_records', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('shift_id');
      $table->timestamp('check_in')->nullable();
      $table->timestamp('check_out')->nullable();
      $table->decimal('total_hours', 5, 2)->nullable();
      $table->timestamps();

      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('shift_id')->references('id')->on('shifts')->cascadeOnDelete();

      $table->unique('shift_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('attendance_records');
  }
};
