<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;

class Order extends Model
{
  use HasFactory, SoftDeletes;

  public $incrementing = false;  // Vô hiệu hóa tự động tăng ID

  protected $keyType = 'string'; // Kiểu khóa chính là string

  protected static function boot(): void
  {
    parent::boot();

    static::creating(function ($model) {
      $model->{$model->getKeyName()} = App::make('snowflake')->id();
    });
  }

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'order_date',
    'total_amount',
    'discount_amount',
    'final_amount',
    'payment_method',
    'status',
    'user_id',
    'store_id',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'order_date' => 'datetime',
    'total_amount' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'final_amount' => 'decimal:2',
  ];

  /**
   * Get the user who created the order
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the store associated with the order
   */
  public function store(): BelongsTo
  {
    return $this->belongsTo(Store::class);
  }

  /**
   * Get the order items for this order
   */
  public function items(): HasMany
  {
    return $this->hasMany(OrderItem::class);
  }
}
