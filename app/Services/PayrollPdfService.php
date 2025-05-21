<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;

class PayrollPdfService
{
    /**
     * Tạo file PDF cho bảng lương
     *
     * @return \Illuminate\Http\Response
     */
    public function generateLatestPayrollPdf(User $user)
    {
        // Lấy bảng lương mới nhất của người dùng
        $payroll = Payroll::where('user_id', $user->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        if (! $payroll) {
            return response()->json(['message' => 'Không tìm thấy bảng lương'], 404);
        }

        return $this->generatePayrollPdf($payroll);
    }

    /**
     * Tạo file PDF cho bảng lương cụ thể
     *
     * @return \Illuminate\Http\Response
     */
    public function generatePayrollPdf(Payroll $payroll)
    {
        // Lấy thông tin người dùng
        $user = User::find($payroll->user_id);

        if (! $user) {
            return response()->json(['message' => 'Không tìm thấy thông tin người dùng'], 404);
        }

        // Tạo view từ blade template
        $html = View::make('pdf.payroll', [
            'payroll' => $payroll,
            'user' => $user,
        ])->render();

        // Tạo PDF từ HTML
        $pdf = PDF::loadHTML($html);

        // Tùy chỉnh PDF
        $pdf->setPaper('a4');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
            'isFontSubsettingEnabled' => true,
            'isPhpEnabled' => true,
        ]);

        // Tên file download
        $filename = 'bang-luong-'.$payroll->month.'-'.$payroll->year.'.pdf';

        // Trả về response để download
        return $pdf->download($filename);
    }
}
