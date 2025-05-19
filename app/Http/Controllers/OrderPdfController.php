<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderPdfService;
use Illuminate\Http\Response;

class OrderPdfController extends Controller
{
    protected $pdfService;

    public function __construct(OrderPdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Tạo và tải xuống file PDF đơn hàng
     *
     * @return Response
     */
    public function download(Order $order)
    {
        return $this->pdfService->generatePdf($order);
    }
}
