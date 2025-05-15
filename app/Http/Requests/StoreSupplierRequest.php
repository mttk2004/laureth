<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreSupplierRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ cho phép DM và SM tạo mới nhà cung cấp
    $user = Auth::user();
    return $user && ($user->isDM() || $user->isSM());
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'name' => 'required|string|max:255',
      'phone' => 'required|string|max:20|unique:suppliers,phone',
      'email' => 'required|email|max:255|unique:suppliers,email',
    ];
  }

  /**
   * Get custom messages for validator errors.
   *
   * @return array
   */
  public function messages(): array
  {
    return [
      'name.required' => 'Tên nhà cung cấp là bắt buộc',
      'name.max' => 'Tên nhà cung cấp không được vượt quá 255 ký tự',
      'phone.required' => 'Số điện thoại là bắt buộc',
      'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự',
      'phone.unique' => 'Số điện thoại này đã được sử dụng',
      'email.required' => 'Email là bắt buộc',
      'email.email' => 'Email không đúng định dạng',
      'email.max' => 'Email không được vượt quá 255 ký tự',
      'email.unique' => 'Email này đã được sử dụng',
    ];
  }
}
