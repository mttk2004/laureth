<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderPdfService;
use Illuminate\Http\Response;

class PurchaseOrderPdfController extends Controller
{
    protected $pdfService;

    public function __construct(PurchaseOrderPdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Tạo và tải xuống file PDF đơn nhập hàng
     *
     * @return Response
     */
    public function download(PurchaseOrder $purchaseOrder)
    {
        return $this->pdfService->generatePdf($purchaseOrder);
    }
}
