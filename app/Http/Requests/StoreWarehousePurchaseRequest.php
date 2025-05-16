<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreWarehousePurchaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Chỉ cho phép DM thực hiện
        $user = Auth::user();

        return $user && ($user->position === 'DM');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => 'required|integer|exists:suppliers,id',
            'order_date' => 'required|date',
            'items' => 'required|json',
        ];
    }

    /**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        if (isset($validated['items'])) {
            $validated['items'] = json_decode($validated['items'], true);
        }

        return $validated;
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'supplier_id.required' => 'Vui lòng chọn nhà cung cấp',
            'supplier_id.exists' => 'Nhà cung cấp không tồn tại',
            'order_date.required' => 'Vui lòng chọn ngày đặt hàng',
            'order_date.date' => 'Ngày đặt hàng không hợp lệ',
            'items.required' => 'Vui lòng thêm ít nhất một sản phẩm',
            'items.json' => 'Dữ liệu sản phẩm không hợp lệ',
        ];
    }
}
