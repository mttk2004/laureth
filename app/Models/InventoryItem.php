<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'warehouse_id',
    'product_id',
    'quantity',
  ];

  /**
   * Get the warehouse that owns this inventory item
   */
  public function warehouse(): BelongsTo
  {
    return $this->belongsTo(Warehouse::class);
  }

  /**
   * Get the product that this inventory item represents
   */
  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }
}
