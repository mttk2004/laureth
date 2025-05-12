<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
  // Nếu người dùng đã đăng nhập, chuyển hướng đến dashboard
  // Nếu chưa, chuyển hướng đến trang đăng nhập
  return Auth::check()
    ? redirect()->route('dashboard')
    : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
  // Sử dụng DashboardController thay vì inline function
  Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
