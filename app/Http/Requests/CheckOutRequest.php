<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CheckOutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Chỉ nhân viên đã đăng nhập được phép chấm công
        return Auth::check() && in_array(Auth::user()->position, ['SL', 'SA']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'shift_id' => [
                'required',
                'integer',
                'exists:shifts,id',
                Rule::exists('shifts', 'id')->where(function ($query) {
                    $query->where('user_id', Auth::id());
                }),
                Rule::exists('attendance_records', 'shift_id')->where(function ($query) {
                    $query->where('user_id', Auth::id())
                        ->whereNotNull('check_in')
                        ->whereNull('check_out');
                }),
            ],
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
            'shift_id' => 'ca làm việc',
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
            'shift_id.required' => ':attribute là bắt buộc',
            'shift_id.exists' => ':attribute không tồn tại, không thuộc về bạn, hoặc bạn chưa chấm công vào',
        ];
    }
}
