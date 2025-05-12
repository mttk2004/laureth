<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;

class Product extends Model
{
  use HasFactory, SoftDeletes;

  public $incrementing = false;  // Vô hiệu hóa tự động tăng ID

  protected $keyType = 'integer'; // Kiểu khóa chính là integer

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
    'name',
    'description',
    'image',
    'category_id',
    'price',
    'status',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'price' => 'decimal:2',
  ];

  /**
   * Get the category that the product belongs to
   */
  public function category(): BelongsTo
  {
    return $this->belongsTo(Category::class);
  }
}
