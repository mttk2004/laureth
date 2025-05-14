<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ DM (quản lý chuỗi) mới có quyền thêm người dùng mới
    return Auth::check() && Auth::user()->position === 'DM';
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
   */
  public function rules(): array
  {
    return [
      'full_name' => ['required', 'string', 'max:255'],
      'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
      'password' => ['required', 'string', 'min:8'],
      'phone' => ['required', 'string', 'max:20'],
      'position' => ['required', 'string', Rule::in(['SM', 'SL', 'SA'])],
      'store_id' => ['required', 'exists:stores,id'],
      'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
      'hourly_wage' => ['nullable', 'numeric', 'min:0'],
      'base_salary' => ['nullable', 'numeric', 'min:0'],
    ];
  }

  /**
   * Prepare the data for validation.
   *
   * @return void
   */
  protected function prepareForValidation()
  {
    // Chuyển đổi commission_rate từ % sang thập phân
    if ($this->commission_rate) {
      $this->merge([
        'commission_rate' => (float)$this->commission_rate / 100,
      ]);
    }
  }

  /**
   * Get custom attributes for validator errors.
   *
   * @return array<string, string>
   */
  public function attributes(): array
  {
    return [
      'full_name' => 'họ và tên',
      'email' => 'email',
      'password' => 'mật khẩu',
      'phone' => 'số điện thoại',
      'position' => 'vị trí',
      'store_id' => 'cửa hàng',
      'commission_rate' => 'tỷ lệ hoa hồng',
      'hourly_wage' => 'lương theo giờ',
      'base_salary' => 'lương cơ bản',
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
      'full_name.required' => 'Vui lòng nhập :attribute.',
      'full_name.max' => ':attribute không được vượt quá :max ký tự.',
      'email.required' => 'Vui lòng nhập :attribute.',
      'email.email' => ':attribute không đúng định dạng.',
      'email.unique' => ':attribute đã tồn tại trong hệ thống.',
      'password.required' => 'Vui lòng nhập :attribute.',
      'password.min' => ':attribute phải có ít nhất :min ký tự.',
      'phone.required' => 'Vui lòng nhập :attribute.',
      'position.required' => 'Vui lòng chọn :attribute.',
      'position.in' => ':attribute không hợp lệ.',
      'store_id.required' => 'Vui lòng chọn :attribute.',
      'store_id.exists' => ':attribute không tồn tại.',
      'commission_rate.numeric' => ':attribute phải là số.',
      'commission_rate.min' => ':attribute không được nhỏ hơn :min%.',
      'commission_rate.max' => ':attribute không được lớn hơn :max%.',
      'hourly_wage.numeric' => ':attribute phải là số.',
      'hourly_wage.min' => ':attribute không được nhỏ hơn :min.',
      'base_salary.numeric' => ':attribute phải là số.',
      'base_salary.min' => ':attribute không được nhỏ hơn :min.',
    ];
  }
}
