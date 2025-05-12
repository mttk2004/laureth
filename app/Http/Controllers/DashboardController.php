<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
  /**
   * Hiển thị trang Dashboard
   */
  public function index()
  {
    // Lấy thông tin user hiện tại
    $user = Auth::user();

    // Log thông tin user để debug
    Log::info('DashboardController - user info:', [
      'id' => $user->id,
      'full_name' => $user->full_name,
      'email' => $user->email,
      'position' => $user->position,
      'store_id' => $user->store_id,
    ]);

    // Truyền thông tin user sang Inertia
    return Inertia::render('dashboard', [
      'user' => $user
    ]);
  }
}
