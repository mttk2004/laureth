<?php

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
  Route::get('dashboard', function () {
    // Lấy thông tin user hiện tại và truyền vào view
    $user = Auth::user();

    // Debug: Log thông tin user ra console
    Log::info('User info for dashboard:', ['user' => $user]);

    return Inertia::render('dashboard', [
      'user' => $user
    ]);
  })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
