<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Chỉ DM (quản lý chuỗi) mới có quyền thêm sản phẩm mới
        return Auth::check() && Auth::user()->position === 'DM';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<\Illuminate\Contracts\Validation\ValidationRule>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên sản phẩm là bắt buộc',
            'name.max' => 'Tên sản phẩm không được quá 255 ký tự',
            'category_id.required' => 'Danh mục là bắt buộc',
            'category_id.exists' => 'Danh mục không tồn tại',
            'price.required' => 'Giá sản phẩm là bắt buộc',
            'price.numeric' => 'Giá sản phẩm phải là số',
            'price.min' => 'Giá sản phẩm không được âm',
            'status.required' => 'Trạng thái sản phẩm là bắt buộc',
            'status.in' => 'Trạng thái sản phẩm không hợp lệ',
            'image.image' => 'File phải là hình ảnh',
            'image.mimes' => 'Định dạng hình ảnh không hỗ trợ (jpg, jpeg, png, gif)',
            'image.max' => 'Kích thước hình ảnh không được vượt quá 2MB',
        ];
    }
}
