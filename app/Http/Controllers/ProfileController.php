<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
  /**
   * Hiển thị thông tin cá nhân của người dùng đăng nhập
   *
   * @return \Inertia\Response
   */
  public function show()
  {
    return Inertia::render('Profile/Index', [
      'user' => Auth::user(),
    ]);
  }
}
