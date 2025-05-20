<?php

namespace App\Http\Requests\InventoryTransfer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreInventoryTransferRequest extends FormRequest
{
    /**
     * Xác định người dùng có được phép thực hiện request này không
     */
    public function authorize(): bool
    {
        // SM hoặc DM có thể tạo yêu cầu chuyển kho
        return Auth::user()->hasRole('sm') || Auth::user()->hasRole('dm');
    }

    /**
     * Các quy tắc xác thực áp dụng cho request
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source_warehouse_id' => ['required', 'exists:warehouses,id'],
            'destination_warehouse_id' => ['required', 'exists:warehouses,id', 'different:source_warehouse_id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Các thông báo lỗi tùy chỉnh
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'source_warehouse_id.required' => 'Vui lòng chọn kho nguồn',
            'source_warehouse_id.exists' => 'Kho nguồn không tồn tại',
            'destination_warehouse_id.required' => 'Vui lòng chọn kho đích',
            'destination_warehouse_id.exists' => 'Kho đích không tồn tại',
            'destination_warehouse_id.different' => 'Kho đích phải khác kho nguồn',
            'product_id.required' => 'Vui lòng chọn sản phẩm',
            'product_id.exists' => 'Sản phẩm không tồn tại',
            'quantity.required' => 'Vui lòng nhập số lượng',
            'quantity.integer' => 'Số lượng phải là số nguyên',
            'quantity.min' => 'Số lượng phải lớn hơn 0',
        ];
    }
}
