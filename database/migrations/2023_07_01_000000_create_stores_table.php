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
    Schema::create('stores', function (Blueprint $table) {
      $table->string('id')->primary();
      $table->string('name', 100);
      $table->text('address');
      $table->string('manager_id')->nullable();
      $table->decimal('monthly_target', 12, 2)->default(0);
      $table->timestamps();
      $table->softDeletes();
    });

    // Xóa phần khóa ngoại ở đây
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('stores');
  }
};
