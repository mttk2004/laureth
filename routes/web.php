<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\UserController;
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
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{productId}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{productId}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{productId}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{userId}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{userId}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{userId}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');
    Route::get('/stores/create', [StoreController::class, 'create'])->name('stores.create');
    Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
    Route::get('/stores/{storeId}/edit', [StoreController::class, 'edit'])->name('stores.edit');
    Route::put('/stores/{storeId}', [StoreController::class, 'update'])->name('stores.update');
    Route::delete('/stores/{storeId}', [StoreController::class, 'destroy'])->name('stores.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
