<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class GeneratePayrollRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return Auth::user()->position === 'DM';
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    return [
      'month' => 'required|integer|min:1|max:12',
      'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'month.required' => 'Vui lòng chọn tháng',
      'month.integer' => 'Tháng phải là số nguyên',
      'month.min' => 'Tháng phải từ 1 đến 12',
      'month.max' => 'Tháng phải từ 1 đến 12',
      'year.required' => 'Vui lòng chọn năm',
      'year.integer' => 'Năm phải là số nguyên',
      'year.min' => 'Năm phải từ 2020 trở đi',
      'year.max' => 'Năm không được vượt quá năm sau',
    ];
  }
}
