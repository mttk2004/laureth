<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'store_id' => ['required', 'exists:stores,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
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
            'total_amount' => 'Tổng tiền',
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
}
