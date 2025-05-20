<?php

namespace App\Http\Controllers;

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
        // Load user với quan hệ store để đảm bảo thông tin cửa hàng được hiển thị đầy đủ
        $user = Auth::user()->load('store');

        return Inertia::render('Profile/Index', [
            'user' => $user,
        ]);
    }
}
