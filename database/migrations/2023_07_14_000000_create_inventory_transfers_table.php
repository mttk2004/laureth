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
    Schema::create('inventory_transfers', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('source_warehouse_id');
      $table->unsignedBigInteger('destination_warehouse_id');
      $table->unsignedBigInteger('requested_by');
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->unsignedBigInteger('product_id');
      $table->integer('quantity');
      $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('source_warehouse_id')->references('id')->on('warehouses')->restrictOnDelete();
      $table->foreign('destination_warehouse_id')->references('id')->on('warehouses')->restrictOnDelete();
      $table->foreign('requested_by')->references('id')->on('users')->restrictOnDelete();
      $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('product_id')->references('id')->on('products')->restrictOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_transfers');
  }
};
