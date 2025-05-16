<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
      ? redirect()->route('dashboard')
      : redirect()->route('login');
})->name('home');

// Route cho tất cả user đã đăng nhập
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Route cho DM (District Manager)
Route::middleware(['web', 'auth', 'verified', 'dm'])->group(function () {
    Route::resources([
        'products' => ProductController::class,
        'users' => UserController::class,
        'stores' => StoreController::class,
        'suppliers' => SupplierController::class,
        'warehouses' => WarehouseController::class,
    ], [
        'except' => ['show'],
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
