<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\App;


class User extends Authenticatable
{
  /** @use HasFactory<\Database\Factories\UserFactory> */
  use HasFactory, Notifiable, SoftDeletes;

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
   * @var list<string>
   */
  protected $fillable = [
    'full_name',
    'email',
    'password',
    'phone',
    'position',
    'hourly_wage',
    'base_salary',
    'commission_rate',
    'store_id',
  ];

  /**
   * The attributes that should be hidden for serialization.
   *
   * @var list<string>
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'hourly_wage' => 'decimal:2',
      'base_salary' => 'decimal:2',
      'commission_rate' => 'decimal:2',
      'last_login' => 'datetime',
    ];
  }

  /**
   * Relationship with store
   */
  public function store(): BelongsTo
  {
    return $this->belongsTo(Store::class);
  }
}
