<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CheckInRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ nhân viên đã đăng nhập được phép chấm công
    return Auth::check() && in_array(Auth::user()->position, ['SL', 'SA']);
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
   */
  public function rules(): array
  {
    return [
      'shift_id' => [
        'required',
        'integer',
        'exists:shifts,id',
        Rule::exists('shifts')->where(function ($query) {
          $query->where('user_id', Auth::id());
        }),
        Rule::unique('attendance_records')->where(function ($query) {
          $query->whereNotNull('check_in');
        }),
      ],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   *
   * @return array<string, string>
   */
  public function attributes(): array
  {
    return [
      'shift_id' => 'ca làm việc',
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'shift_id.required' => ':attribute là bắt buộc',
      'shift_id.exists' => ':attribute không tồn tại hoặc không thuộc về bạn',
      'shift_id.unique' => 'Bạn đã chấm công vào cho ca làm việc này rồi',
    ];
  }
}
