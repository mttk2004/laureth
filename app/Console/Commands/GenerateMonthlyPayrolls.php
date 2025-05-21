<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyPayrolls extends Command
{
    protected $signature = 'payrolls:generate {month?} {year?}';

    protected $description = 'Tạo bảng lương cho tất cả nhân viên theo tháng và năm chỉ định';

    private $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        parent::__construct();
        $this->payrollService = $payrollService;
    }

    public function handle()
    {
        // Lấy tháng và năm từ tham số hoặc sử dụng tháng hiện tại
        $month = $this->argument('month') ?? Carbon::now()->month;
        $year = $this->argument('year') ?? Carbon::now()->year;

        $this->info("Đang tạo bảng lương cho tháng {$month}/{$year}...");

        // Lấy tất cả nhân viên có store_id (đang làm việc)
        $users = User::whereNotNull('store_id')->get();
        $count = 0;

        $this->output->progressStart(count($users));

        foreach ($users as $user) {
            // Kiểm tra xem đã có bảng lương cho nhân viên này trong tháng này chưa
            $payrollExists = $this->payrollService->checkPayrollExists($user->id, $month, $year);

            if (! $payrollExists) {
                // Tạo bảng lương cho nhân viên
                $this->payrollService->createPayrollForUser($user, $month, $year);
                $count++;
            }

            $this->output->progressAdvance();
        }

        $this->output->progressFinish();
        $this->info("Đã tạo {$count} bảng lương mới cho tháng {$month}/{$year}");
    }
}
