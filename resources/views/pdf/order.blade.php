<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng #{{ substr($order->id, -6) }}</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .header-left {
            float: left;
            width: 50%;
        }
        .header-right {
            float: right;
            width: 50%;
            text-align: right;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            margin: 0;
        }
        .company-desc {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
        }
        .document-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }
        .document-number {
            font-size: 14px;
            margin: 5px 0;
        }
        .document-date {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
        }
        .info-section {
            margin-bottom: 20px;
            width: 100%;
            overflow: hidden;
        }
        .info-column {
            float: left;
            width: 48%;
        }
        .info-column-right {
            float: right;
            width: 48%;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
        }
        .info-name {
            font-weight: bold;
            margin-bottom: 3px;
        }
        .info-text {
            margin: 3px 0;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .item-table th {
            background-color: #f5f5f5;
            border-bottom: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
            text-align: left;
        }
        .item-table th.center {
            text-align: center;
        }
        .item-table th.right {
            text-align: right;
        }
        .item-table td {
            border-bottom: 1px solid #eee;
            padding: 8px;
            font-size: 12px;
        }
        .item-table td.center {
            text-align: center;
        }
        .item-table td.right {
            text-align: right;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 3px;
        }
        .totals-section {
            float: right;
            margin-bottom: 30px;
        }
        .totals-table {
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .totals-label {
            font-weight: bold;
        }
        .totals-value-highlight {
            font-weight: bold;
            color: #047857;
        }
        .signatures {
            margin-top: 40px;
            page-break-inside: avoid;
            clear: both;
            width: 100%;
            overflow: hidden;
        }
        .signature-left {
            float: left;
            width: 48%;
            text-align: center;
        }
        .signature-right {
            float: right;
            width: 48%;
            text-align: center;
        }
        .signature-title {
            font-weight: bold;
            margin-bottom: 50px;
        }
        .signature-name {
            margin-top: 5px;
        }
        .signature-line {
            margin-top: 50px;
            font-style: italic;
            color: #666;
        }
        .page-break {
            page-break-after: always;
        }
        /* Helper utility */
        .clearfix:after {
            content: "";
            display: table;
            clear: both;
        }
        .payment-info {
            margin-top: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 4px;
        }
        .payment-method {
            font-weight: bold;
            color: #0066ff;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        .status-completed {
            background-color: #d1fae5;
            color: #047857;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-canceled {
            background-color: #fee2e2;
            color: #b91c1c;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header clearfix">
            <div class="header-left">
                <h1 class="company-name">LAURETH</h1>
                <p class="company-desc">Phụ kiện thời trang Laureth</p>
            </div>
            <div class="header-right">
                <h2 class="document-title">HÓA ĐƠN BÁN HÀNG</h2>
                <p class="document-number">#{{ $order->id }}</p>
                <p class="document-date">Ngày: {{ date('d/m/Y', strtotime($order->order_date)) }}</p>
            </div>
        </div>

        <!-- Info Section -->
        <div class="info-section clearfix">
            <div class="info-column">
                <h3 class="section-title">THÔNG TIN CỬA HÀNG</h3>
                @if($order->store)
                    <p class="info-name">{{ $order->store->name }}</p>
                    <p class="info-text">Địa chỉ: {{ $order->store->address }}</p>
                @else
                    <p class="info-text" style="font-style: italic;">Không có thông tin cửa hàng</p>
                @endif
            </div>
            <div class="info-column-right">
                <h3 class="section-title">THÔNG TIN THANH TOÁN</h3>
                <div class="payment-info">
                    <p class="info-text">
                        Phương thức:
                        <span class="payment-method">
                            @if($order->payment_method == 'cash')
                                Tiền mặt
                            @elseif($order->payment_method == 'card')
                                Thẻ
                            @elseif($order->payment_method == 'transfer')
                                Chuyển khoản
                            @else
                                {{ $order->payment_method }}
                            @endif
                        </span>
                    </p>
                    <p class="info-text">
                        Trạng thái:
                        <span class="status-badge
                            @if($order->status == 'completed')
                                status-completed
                            @elseif($order->status == 'pending')
                                status-pending
                            @elseif($order->status == 'canceled')
                                status-canceled
                            @endif">
                            @if($order->status == 'completed')
                                Hoàn thành
                            @elseif($order->status == 'pending')
                                Đang xử lý
                            @elseif($order->status == 'canceled')
                                Đã hủy
                            @else
                                {{ $order->status }}
                            @endif
                        </span>
                    </p>
                    <p class="info-text">Nhân viên: {{ $order->user ? $order->user->full_name : 'N/A' }}</p>
                </div>
            </div>
        </div>

        <!-- Item Table -->
        <h3 class="section-title">CHI TIẾT ĐƠN HÀNG</h3>
        @if($order->items->count() > 0)
            <table class="item-table">
                <thead>
                    <tr>
                        <th style="width: 5%">STT</th>
                        <th style="width: 45%">Sản phẩm</th>
                        <th class="center" style="width: 15%">Số lượng</th>
                        <th class="right" style="width: 15%">Đơn giá</th>
                        <th class="right" style="width: 20%">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $index => $item)
                        <tr>
                            <td class="center">{{ $index + 1 }}</td>
                            <td>
                                <div>
                                    <p class="product-name">{{ $item->product ? $item->product->name : 'Sản phẩm #' . $item->product_id }}</p>
                                </div>
                            </td>
                            <td class="center">{{ $item->quantity }}</td>
                            <td class="right">{{ number_format($item->unit_price, 0, ',', '.') }} ₫</td>
                            <td class="right">{{ number_format($item->total_price, 0, ',', '.') }} ₫</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Totals Section -->
            <div class="totals-section">
                <div class="totals-table">
                    <div class="totals-row">
                        <span class="totals-label">Tổng số lượng:</span>
                        <span>{{ $totalQuantity }} sản phẩm</span>
                    </div>
                    <div class="totals-row">
                        <span class="totals-label">Tổng tiền hàng:</span>
                        <span>{{ number_format($order->total_amount, 0, ',', '.') }} ₫</span>
                    </div>
                    <div class="totals-row">
                        <span class="totals-label">Giảm giá:</span>
                        <span>{{ number_format($order->discount_amount, 0, ',', '.') }} ₫</span>
                    </div>
                    <div class="totals-row">
                        <span class="totals-label">Thanh toán:</span>
                        @php
                            // Tính lại final_amount để đảm bảo chính xác
                            $finalAmount = $order->total_amount - $order->discount_amount;
                            // Ghi log nếu có sai lệch
                            if (abs($order->final_amount - $finalAmount) > 0.01) {
                                \Illuminate\Support\Facades\Log::warning("Phát hiện sai lệch trong final_amount của đơn hàng {$order->id}, giá trị đúng phải là: {$finalAmount}");
                            }
                        @endphp
                        <span class="totals-value-highlight">{{ number_format($finalAmount, 0, ',', '.') }} ₫</span>
                    </div>
                </div>
            </div>
        @else
            <p style="text-align: center; font-style: italic; color: #666;">Không có sản phẩm nào trong đơn hàng</p>
        @endif

        <!-- Signatures Section -->
        <div class="signatures clearfix">
            <div class="signature-left">
                <p class="signature-title">Người mua hàng</p>
                <p class="signature-line">(Ký, ghi rõ họ tên)</p>
            </div>
            <div class="signature-right">
                <p class="signature-title">Người bán hàng</p>
                @if($order->user)
                    <p class="signature-name">{{ $order->user->full_name }}</p>
                @endif
                <p class="signature-line">(Ký, ghi rõ họ tên)</p>
            </div>
        </div>
    </div>
</body>
</html>
