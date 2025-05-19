<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class OrderStatusUpdateRequest extends FormRequest
{
    /**
     * Xác định người dùng có quyền thực hiện request này không
     */
    public function authorize(): bool
    {
        return Auth::check() && (Auth::user()->position === 'SL' || Auth::user()->position === 'SA');
    }

    /**
     * Quy tắc xác thực dữ liệu
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['pending', 'completed', 'canceled'])],
        ];
    }

    /**
     * Thông báo lỗi tùy chỉnh
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Trạng thái đơn hàng là bắt buộc',
            'status.in' => 'Trạng thái đơn hàng không hợp lệ',
        ];
    }
}
