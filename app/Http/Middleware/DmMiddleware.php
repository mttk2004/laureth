<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DmMiddleware
{
  /**
   * Handle an incoming request.
   *
   * @param Closure(Request): (Response) $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $user = $request->user();

    // Log thông tin để debug
    Log::info('DM Middleware check:', [
      'user' => $user ? $user->toArray() : null,
      'position' => $user ? $user->position : null
    ]);

    if (!$user) {
      return redirect('/login')->with('error', 'Vui lòng đăng nhập để tiếp tục.');
    }

    if (!$user->isDm()) {
      return redirect('/dashboard')->with('error', 'Bạn không có quyền truy cập trang này.');
    }

    return $next($request);
  }
}
