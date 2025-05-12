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
    Schema::create('purchase_order_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('purchase_order_id');
      $table->unsignedBigInteger('product_id');
      $table->integer('quantity');
      $table->decimal('purchase_price', 10, 2);
      $table->decimal('selling_price', 10, 2);
      $table->timestamps();

      $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->cascadeOnDelete();
      $table->foreign('product_id')->references('id')->on('products')->restrictOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('purchase_order_items');
  }
};
