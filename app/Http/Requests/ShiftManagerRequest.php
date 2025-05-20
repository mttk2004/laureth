<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ShiftManagerRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ cho phép SM thực hiện request này
    return Auth::user() && Auth::user()->isSm();
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'user_id' => 'required|exists:users,id',
      'date' => 'required|date|after_or_equal:today',
      'shift_type' => 'required|in:A,B',
    ];
  }

  /**
   * Get custom messages for validator errors.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'user_id.required' => 'Vui lòng chọn nhân viên',
      'user_id.exists' => 'Nhân viên không tồn tại',
      'date.required' => 'Vui lòng chọn ngày',
      'date.date' => 'Ngày không hợp lệ',
      'date.after_or_equal' => 'Ngày phải từ hôm nay trở đi',
      'shift_type.required' => 'Vui lòng chọn ca làm việc',
      'shift_type.in' => 'Ca làm việc không hợp lệ',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Nếu date là string, chuyển đổi sang định dạng Y-m-d
    if (is_string($this->input('date'))) {
      $this->merge([
        'date' => date('Y-m-d', strtotime($this->input('date'))),
      ]);
    }
  }
}
