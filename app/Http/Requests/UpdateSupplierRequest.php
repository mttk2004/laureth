<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Chỉ cho phép DM cập nhật nhà cung cấp
    $user = Auth::user();
    return $user && $user->isDM();
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    // Lấy supplier ID từ request
    $supplierId = request()->route('supplier');

    return [
      'name' => 'required|string|max:255',
      'phone' => [
        'required',
        'string',
        'max:20',
        Rule::unique('suppliers', 'phone')->ignore($supplierId)
      ],
      'email' => [
        'required',
        'email',
        'max:255',
        Rule::unique('suppliers', 'email')->ignore($supplierId)
      ],
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
