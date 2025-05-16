<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreWarehouseRequest extends FormRequest
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
            'name' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'is_main' => 'boolean',
            'store_id' => 'nullable|string|exists:stores,id',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên kho là bắt buộc',
            'name.max' => 'Tên kho không được vượt quá 100 ký tự',
            'address.required' => 'Địa chỉ kho là bắt buộc',
            'address.max' => 'Địa chỉ kho không được vượt quá 255 ký tự',
            'store_id.exists' => 'Cửa hàng không tồn tại',
        ];
    }
}
