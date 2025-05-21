<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Bảng lương - {{ $payroll->month }}/{{ $payroll->year }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            margin: 0;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-section h2 {
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-row {
            display: flex;
            margin-bottom: 5px;
        }
        .info-label {
            width: 200px;
            font-weight: bold;
        }
        .info-value {
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BẢNG LƯƠNG</h1>
            <p>Tháng {{ $payroll->month }}/{{ $payroll->year }}</p>
        </div>

        <div class="info-section">
            <h2>Thông tin nhân viên</h2>
            <div class="info-row">
                <div class="info-label">Họ và tên:</div>
                <div class="info-value">{{ $user->full_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">ID nhân viên:</div>
                <div class="info-value">{{ $user->id }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Vị trí:</div>
                <div class="info-value">
                    @switch($user->position)
                        @case('DM')
                            Quản lý chuỗi
                            @break
                        @case('SM')
                            Quản lý cửa hàng
                            @break
                        @case('SL')
                            Trưởng ca
                            @break
                        @case('SA')
                            Nhân viên bán hàng
                            @break
                        @default
                            {{ $user->position }}
                    @endswitch
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Cửa hàng:</div>
                <div class="info-value">{{ $user->store ? $user->store->name : 'Không áp dụng' }}</div>
            </div>
        </div>

        <div class="info-section">
            <h2>Chi tiết lương</h2>
            <table>
                <tr>
                    <th>Hạng mục</th>
                    <th>Số tiền (VNĐ)</th>
                </tr>
                <tr>
                    <td>Lương cơ bản</td>
                    <td>{{ number_format($payroll->base_amount, 0, ',', '.') }}</td>
                </tr>
                @if($user->position === 'SL' || $user->position === 'SA')
                <tr>
                    <td>Tổng số giờ làm việc</td>
                    <td>{{ $payroll->total_hours }} giờ</td>
                </tr>
                @endif
                <tr>
                    <td>Hoa hồng</td>
                    <td>{{ number_format($payroll->commission_amount, 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td>Tổng cộng</td>
                    <td>{{ number_format($payroll->final_amount, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div class="info-section">
            <h2>Trạng thái thanh toán</h2>
            <div class="info-row">
                <div class="info-label">Trạng thái:</div>
                <div class="info-value">
                    @if($payroll->status === 'paid')
                        Đã thanh toán
                    @else
                        Chưa thanh toán
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Ngày tạo bảng lương:</div>
                <div class="info-value">{{ date('d/m/Y', strtotime($payroll->created_at)) }}</div>
            </div>
        </div>

        <div class="footer">
            <p>Đây là tài liệu được tạo tự động từ hệ thống LAURETH. Vui lòng liên hệ với quản lý để biết thêm chi tiết.</p>
            <p>Ngày in: {{ date('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
