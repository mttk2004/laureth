<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;

class Store extends Model
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
        'name',
        'address',
        'manager_id',
        'monthly_target',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'monthly_target' => 'decimal:2',
    ];

    /**
     * Get the manager of the store
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get all employees of the store
     */
    public function employees(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the warehouse of the store
     */
    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    /**
     * Get all inventory items of the store through warehouses
     */
    public function inventoryItems(): HasManyThrough
    {
        return $this->hasManyThrough(InventoryItem::class, Warehouse::class);
    }
}
