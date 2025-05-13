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
    Schema::create('inventory_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('warehouse_id');
      $table->string('product_id');
      $table->unsignedSmallInteger('quantity')->default(0);
      $table->timestamps();

      $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
      $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();

      $table->unique(['warehouse_id', 'product_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_items');
  }
};
