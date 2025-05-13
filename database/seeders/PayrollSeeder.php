<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Payroll;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo bảng lương cho tháng trước
        $lastMonth = Carbon::now()->subMonth();
        $month = $lastMonth->month;
        $year = $lastMonth->year;

        $users = User::whereNotNull('store_id')->get();

        foreach ($users as $user) {
            // Tính tổng số giờ làm việc trong tháng trước
            $totalHours = AttendanceRecord::where('user_id', $user->id)
                ->whereMonth('check_in', $month)
                ->whereYear('check_in', $year)
                ->sum('total_hours');

            if ($totalHours <= 0) {
                $totalHours = rand(120, 180); // Giá trị mặc định nếu không có dữ liệu
            }

            // Tính lương cơ bản
            $baseAmount = 0;
            if ($user->position === 'SL' || $user->position === 'SA') {
                // Nhân viên làm theo giờ
                $baseAmount = $user->hourly_wage * $totalHours;
            } else {
                // Quản lý hưởng lương cơ bản
                $baseAmount = $user->base_salary;
            }

            // Tính hoa hồng (giả sử 0-5% tổng doanh số)
            $commissionAmount = 0;
            if ($user->commission_rate > 0) {
                // Giả định doanh số bán hàng
                $avgSalesPerHour = rand(1, 5) * 1000000; // 1-5 triệu/giờ
                $totalSales = $totalHours * $avgSalesPerHour;
                $commissionAmount = $totalSales * ($user->commission_rate / 100);
            }

            $finalAmount = $baseAmount + $commissionAmount;

            Payroll::create([
                'user_id' => $user->id,
                'month' => $month,
                'year' => $year,
                'base_amount' => $baseAmount,
                'total_hours' => $totalHours,
                'commission_amount' => $commissionAmount,
                'final_amount' => $finalAmount,
                'status' => 'paid',
            ]);
        }
    }
}
