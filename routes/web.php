<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductInventoryController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseInventoryController;
use App\Http\Controllers\WarehousePurchaseController;
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

  // Route cho warehouse purchase
  Route::get('/warehouses/{warehouse}/purchase', [WarehousePurchaseController::class, 'create'])->name('warehouses.purchase.create');
  Route::post('/warehouses/{warehouse}/purchase', [WarehousePurchaseController::class, 'store'])->name('warehouses.purchase.store');

  // API route để lấy danh sách inventory items của warehouse
  Route::get('/api/warehouses/{warehouse}/inventory', [WarehouseInventoryController::class, 'getInventory']);

  // API route để lấy tổng số lượng của một sản phẩm trong tất cả kho
  Route::get('/api/products/{product}/total-inventory', [ProductInventoryController::class, 'getTotalInventory']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
