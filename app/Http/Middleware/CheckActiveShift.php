<?php

namespace App\Http\Middleware;

use App\Models\AttendanceRecord;
use App\Models\Shift;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveShift
{
  /**
   * Kiểm tra xem nhân viên có đang trong ca làm việc hay không
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $user = Auth::user();

    // Nếu không phải nhân viên (SL hoặc SA) thì cho phép truy cập
    if (!$user || !in_array($user->position, ['SL', 'SA'])) {
      return $next($request);
    }

    // Kiểm tra xem nhân viên có ca làm việc hôm nay không
    $today = now()->toDateString();
    $shift = Shift::where('user_id', $user->id)
      ->where('date', $today)
      ->where('status', '!=', 'absent')
      ->first();

    if (!$shift) {
      return redirect()->route('dashboard')->with('error', 'Bạn không có ca làm việc hôm nay. Không thể truy cập chức năng bán hàng.');
    }

    // Kiểm tra xem nhân viên đã check-in chưa
    $attendance = AttendanceRecord::where('shift_id', $shift->id)
      ->where('user_id', $user->id)
      ->whereNotNull('check_in')
      ->whereNull('check_out')
      ->first();

    if (!$attendance) {
      return redirect()->route('attendance.index')->with('error', 'Bạn chưa check-in cho ca làm việc hôm nay. Vui lòng check-in trước khi sử dụng chức năng bán hàng.');
    }

    return $next($request);
  }
}
