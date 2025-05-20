<?php

namespace App\Http\Requests\InventoryTransfer;

use App\Models\InventoryTransfer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateInventoryTransferRequest extends FormRequest
{
  /**
   * Xác định người dùng có được phép thực hiện request này không
   *
   * @return bool
   */
  public function authorize(): bool
  {
    // SM hoặc DM có thể cập nhật yêu cầu chuyển kho
    return Auth::user()->hasRole('sm') || Auth::user()->hasRole('dm');
  }

  /**
   * Các quy tắc xác thực áp dụng cho request
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'status' => [
        'required',
        Rule::in(['approved', 'rejected', 'completed']),
      ],
    ];
  }

  /**
   * Các thông báo lỗi tùy chỉnh
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'status.required' => 'Vui lòng chọn trạng thái',
      'status.in' => 'Trạng thái không hợp lệ',
    ];
  }
}
