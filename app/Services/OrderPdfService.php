<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;

class OrderPdfService
{
    /**
     * Tạo file PDF cho đơn hàng
     *
     * @return \Illuminate\Http\Response
     */
    public function generatePdf(Order $order)
    {
        // Lấy đơn hàng với các quan hệ liên quan
        $order->load(['items.product', 'user', 'store']);

        // Tính toán tổng số lượng
        $totalQuantity = $order->items->sum('quantity');

        // Đảm bảo final_amount được tính chính xác
        $finalAmount = $order->total_amount - $order->discount_amount;
        if (abs($order->final_amount - $finalAmount) > 0.01) {
            Log::warning("Phát hiện sai lệch trong final_amount của đơn hàng {$order->id}, đang điều chỉnh để hiển thị chính xác");
            $order->final_amount = $finalAmount;

            // Lưu lại giá trị đúng vào database để tránh lỗi trong tương lai
            $order->save();
        }

        // Tạo view từ blade template
        $html = View::make('pdf.order', [
            'order' => $order,
            'totalQuantity' => $totalQuantity,
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
        $filename = 'don-hang-'.substr($order->id, -6).'.pdf';

        // Trả về response để download
        return $pdf->download($filename);
    }
}
