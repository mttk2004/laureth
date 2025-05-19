<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Validation\Validator;

class OrderRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return Auth::check() && (Auth::user()->position === 'SL' || Auth::user()->position === 'SA');
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'order_date' => ['required', 'date'],
      'total_amount' => ['required', 'numeric', 'min:0'],
      'discount_amount' => ['required', 'numeric', 'min:0'],
      'final_amount' => ['required', 'numeric', 'min:0'],
      'payment_method' => ['required', Rule::in(['cash', 'card', 'transfer'])],
      'status' => ['required', Rule::in(['completed', 'canceled', 'pending'])],
      'store_id' => ['required', 'string', 'exists:stores,id'],
      'items' => ['required', 'array', 'min:1'],
      'items.*.product_id' => ['required', 'string', 'exists:products,id'],
      'items.*.quantity' => ['required', 'integer', 'min:1'],
      'items.*.unit_price' => ['required', 'numeric', 'min:0'],
      'items.*.total_price' => ['required', 'numeric', 'min:0'],
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
      'order_date' => 'Ngày đặt hàng',
      'total_amount' => 'Tổng tiền hàng',
      'discount_amount' => 'Giảm giá',
      'final_amount' => 'Thành tiền',
      'payment_method' => 'Phương thức thanh toán',
      'status' => 'Trạng thái',
      'store_id' => 'Cửa hàng',
      'items' => 'Sản phẩm',
      'items.*.product_id' => 'Mã sản phẩm',
      'items.*.quantity' => 'Số lượng',
      'items.*.unit_price' => 'Đơn giá',
      'items.*.total_price' => 'Thành tiền',
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
      'items.min' => 'Đơn hàng phải có ít nhất một sản phẩm',
      'items.*.quantity.min' => 'Số lượng sản phẩm phải lớn hơn 0',
      'items.*.unit_price.min' => 'Đơn giá sản phẩm phải lớn hơn 0',
      'items.*.total_price.min' => 'Thành tiền sản phẩm phải lớn hơn 0',
    ];
  }

  /**
   * Configure the validator instance.
   *
   * @param  \Illuminate\Contracts\Validation\Validator  $validator
   * @return void
   */
  public function withValidator(Validator $validator)
  {
    $validator->after(function ($validator) {
      $data = $validator->getData();

      // Kiểm tra final_amount phải bằng total_amount - discount_amount
      $expectedFinalAmount = $data['total_amount'] - $data['discount_amount'];
      if (abs($data['final_amount'] - $expectedFinalAmount) > 0.01) { // Dùng sai số nhỏ để tránh vấn đề làm tròn số thập phân
        $validator->errors()->add(
          'final_amount',
          'Thành tiền phải bằng tổng tiền hàng trừ đi giảm giá'
        );

        // Ghi log cảnh báo về sai lệch
        \Illuminate\Support\Facades\Log::warning("Phát hiện sai lệch trong final_amount của đơn hàng, giá trị đúng phải là: {$expectedFinalAmount}");
      }

      // Kiểm tra tổng tiền của các sản phẩm phải bằng total_amount
      $itemsTotal = array_reduce($data['items'], function ($sum, $item) {
        return $sum + $item['total_price'];
      }, 0);

      if (abs($data['total_amount'] - $itemsTotal) > 0.01) {
        $validator->errors()->add(
          'total_amount',
          'Tổng tiền hàng phải bằng tổng giá trị của tất cả sản phẩm'
        );
      }
    });
  }
}
