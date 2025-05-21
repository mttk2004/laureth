<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Tạo bảng lương vào ngày cuối cùng của tháng lúc 23:55
        $schedule->command('payrolls:generate')
            ->monthlyOn(28, '23:55')
            ->when(function () {
                // Chỉ chạy vào ngày cuối cùng của tháng
                return date('t') == date('d');
            });
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
