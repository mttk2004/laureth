<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'purchase_order_id',
    'product_id',
    'quantity',
    'purchase_price',
    'selling_price',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'purchase_price' => 'decimal:2',
    'selling_price' => 'decimal:2',
  ];

  /**
   * Get the purchase order this item belongs to
   */
  public function purchaseOrder(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrder::class);
  }

  /**
   * Get the product for this purchase order item
   */
  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }
}
