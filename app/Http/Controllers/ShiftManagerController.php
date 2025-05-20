<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShiftManagerRequest;
use App\Models\Shift;
use App\Models\User;
use App\Services\ShiftManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShiftManagerController extends Controller
{
  private $shiftManagerService;

  public function __construct(ShiftManagerService $shiftManagerService)
  {
    $this->shiftManagerService = $shiftManagerService;
  }

  /**
   * Hiển thị trang quản lý ca làm việc cho SM
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    $user = Auth::user();

    // Lấy tháng và năm từ request hoặc sử dụng tháng hiện tại
    $month = $request->input('month', now()->month);
    $year = $request->input('year', now()->year);

    // Lấy danh sách ca làm việc của cửa hàng trong tháng
    $shifts = $this->shiftManagerService->getShiftsByStoreAndMonth($user->store_id, $month, $year);

    // Lấy danh sách nhân viên của cửa hàng
    $staff = $this->shiftManagerService->getStoreStaff($user->store_id);

    return Inertia::render('ShiftManager/Index', [
      'user' => $user,
      'shifts' => $shifts,
      'staff' => $staff,
      'filters' => [
        'month' => $month,
        'year' => $year,
      ],
    ]);
  }

  /**
   * Hiển thị form tạo ca làm việc mới
   *
   * @return \Inertia\Response
   */
  public function create()
  {
    $user = Auth::user();

    // Lấy danh sách nhân viên của cửa hàng
    $staff = $this->shiftManagerService->getStoreStaff($user->store_id);

    return Inertia::render('ShiftManager/Create', [
      'user' => $user,
      'staff' => $staff,
    ]);
  }

  /**
   * Lưu ca làm việc mới
   *
   * @param  \App\Http\Requests\ShiftManagerRequest  $request
   * @return \Illuminate\Http\RedirectResponse
   */
  public function store(ShiftManagerRequest $request)
  {
    $user = Auth::user();

    $this->shiftManagerService->createShift(
      $request->validated(),
      $user->store_id
    );

    return redirect()->route('shifts-management.index')->with('success', 'Ca làm việc đã được tạo thành công');
  }

  /**
   * Xóa ca làm việc
   *
   * @param  \App\Models\Shift  $shift
   * @return \Illuminate\Http\RedirectResponse
   */
  public function destroy(Shift $shift)
  {
    $user = Auth::user();

    // Kiểm tra xem ca làm việc có thuộc cửa hàng của SM không
    if ($shift->store_id !== $user->store_id) {
      return redirect()->back()->with('error', 'Bạn không có quyền xóa ca làm việc này');
    }

    // Kiểm tra xem ca làm việc đã hoàn thành chưa
    if ($shift->status === 'completed') {
      return redirect()->back()->with('error', 'Không thể xóa ca làm việc đã hoàn thành');
    }

    $this->shiftManagerService->deleteShift($shift->id);

    return redirect()->back()->with('success', 'Ca làm việc đã được xóa thành công');
  }

  /**
   * Lấy danh sách nhân viên của cửa hàng
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function getStoreStaff()
  {
    $user = Auth::user();

    $staff = $this->shiftManagerService->getStoreStaff($user->store_id);

    return response()->json($staff);
  }

  /**
   * Lấy danh sách ca làm việc của cửa hàng trong tháng
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function getMonthShifts(Request $request)
  {
    $user = Auth::user();

    $month = $request->input('month', now()->month);
    $year = $request->input('year', now()->year);

    $shifts = $this->shiftManagerService->getShiftsByStoreAndMonth($user->store_id, $month, $year);

    return response()->json($shifts);
  }

  /**
   * Lưu nhiều ca làm việc cùng lúc
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function storeBulk(Request $request)
  {
    $user = Auth::user();

    $request->validate([
      'shifts' => 'required|array',
      'shifts.*.user_id' => 'required|exists:users,id',
      'shifts.*.date' => 'required|date',
      'shifts.*.shift_type' => 'required|in:A,B',
    ]);

    $result = $this->shiftManagerService->createBulkShifts(
      $request->shifts,
      $user->store_id
    );

    return response()->json([
      'success' => true,
      'message' => 'Ca làm việc đã được tạo thành công',
      'created' => $result['created'],
      'skipped' => $result['skipped'],
    ]);
  }
}
