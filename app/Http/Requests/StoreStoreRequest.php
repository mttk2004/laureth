<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStoreRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ DM (quản lý chuỗi) mới có quyền thêm cửa hàng mới
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
      'name' => ['required', 'string', 'max:255'],
      'address' => ['required', 'string', 'max:255'],
      'manager_id' => ['nullable', 'exists:users,id'],
      'monthly_target' => ['required', 'numeric', 'min:0'],
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
      'name' => 'tên cửa hàng',
      'address' => 'địa chỉ',
      'manager_id' => 'quản lý',
      'monthly_target' => 'mục tiêu tháng',
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
      'name.required' => 'Vui lòng nhập :attribute.',
      'name.max' => ':attribute không được vượt quá :max ký tự.',
      'address.required' => 'Vui lòng nhập :attribute.',
      'address.max' => ':attribute không được vượt quá :max ký tự.',
      'manager_id.required' => 'Vui lòng chọn :attribute.',
      'manager_id.exists' => ':attribute không tồn tại.',
      'monthly_target.required' => 'Vui lòng nhập :attribute.',
      'monthly_target.numeric' => ':attribute phải là số.',
      'monthly_target.min' => ':attribute không được nhỏ hơn :min.',
    ];
  }
}
