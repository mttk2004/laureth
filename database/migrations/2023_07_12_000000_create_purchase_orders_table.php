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
    Schema::create('purchase_orders', function (Blueprint $table) {
      $table->string('id')->primary();
      $table->unsignedBigInteger('supplier_id');
      $table->unsignedBigInteger('warehouse_id');
      $table->string('user_id');
      $table->timestamp('order_date');
      $table->decimal('total_amount', 12, 2)->unsigned();
      $table->enum('status', ['pending', 'received', 'cancelled'])->default('pending');
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('supplier_id')->references('id')->on('suppliers')->restrictOnDelete();
      $table->foreign('warehouse_id')->references('id')->on('warehouses')->restrictOnDelete();
      $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('purchase_orders');
  }
};
