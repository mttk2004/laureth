<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateProductRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Kiểm tra quyền của người dùng
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
      'description' => ['nullable', 'string'],
      'category_id' => ['required', 'exists:categories,id'],
      'price' => ['required', 'numeric', 'min:0'],
      'status' => ['required', Rule::in(['active', 'inactive'])],
      'image' => ['nullable', 'image', 'max:2048'], // Max 2MB
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
      'name' => 'tên sản phẩm',
      'description' => 'mô tả',
      'category_id' => 'danh mục',
      'price' => 'giá',
      'status' => 'trạng thái',
      'image' => 'hình ảnh',
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
      'category_id.required' => 'Vui lòng chọn :attribute.',
      'category_id.exists' => ':attribute không tồn tại.',
      'price.required' => 'Vui lòng nhập :attribute.',
      'price.numeric' => ':attribute phải là số.',
      'price.min' => ':attribute không được nhỏ hơn :min.',
      'status.required' => 'Vui lòng chọn :attribute.',
      'status.in' => ':attribute không hợp lệ.',
      'image.image' => ':attribute phải là một hình ảnh.',
      'image.max' => ':attribute không được vượt quá :max KB.',
    ];
  }
}
