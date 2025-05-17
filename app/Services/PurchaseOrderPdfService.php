<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;

class PurchaseOrderPdfService
{
    /**
     * Tạo file PDF cho đơn nhập hàng
     *
     * @return \Illuminate\Http\Response
     */
    public function generatePdf(PurchaseOrder $purchaseOrder)
    {
        // Lấy đơn hàng với các quan hệ liên quan
        $purchaseOrder->load(['items.product', 'supplier', 'warehouse', 'user']);

        // Tính toán tổng số lượng
        $totalQuantity = $purchaseOrder->items->sum('quantity');

        // Tạo view từ blade template
        $html = View::make('pdf.purchase-order', [
            'purchaseOrder' => $purchaseOrder,
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
        $filename = 'don-nhap-hang-'.substr($purchaseOrder->id, -6).'.pdf';

        // Trả về response để download
        return $pdf->download($filename);
    }
}
