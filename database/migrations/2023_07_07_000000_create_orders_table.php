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
    Schema::create('orders', function (Blueprint $table) {
      $table->string('id')->primary();
      $table->timestamp('order_date');
      $table->decimal('total_amount', 12, 1)->unsigned();
      $table->decimal('discount_amount', 10, 1)->unsigned()->default(0);
      $table->decimal('final_amount', 12, 1)->unsigned();
      $table->enum('payment_method', ['cash', 'card', 'transfer'])->default('cash');
      $table->enum('status', ['completed', 'canceled', 'pending'])->default('pending');
      $table->string('user_id');
      $table->string('store_id');
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
      $table->foreign('store_id')->references('id')->on('stores')->restrictOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('orders');
  }
};
