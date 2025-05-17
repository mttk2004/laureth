<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payroll;
use App\Models\PurchaseOrder;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportService
{
  /**
   * Lấy thông tin tổng quan về doanh thu
   *
   * @param  string|null  $period  Kỳ báo cáo (month, quarter, year, all)
   * @param  int|null  $year  Năm của kỳ báo cáo
   */
  public function getRevenueSummary(?string $period = 'month', ?int $year = null): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;
    $currentYear = Carbon::now()->year;

    // Tổng doanh thu theo kỳ
    $revenueByPeriod = [];
    $periodLabels = [];

    switch ($period) {
      case 'month':
        // Doanh thu theo tháng (12 tháng gần nhất)
        $revenueByPeriod = $this->getMonthlyRevenue($year);
        for ($i = 1; $i <= 12; $i++) {
          $periodLabels[] = "Tháng $i";
        }
        break;

      case 'quarter':
        // Doanh thu theo quý (4 quý gần nhất)
        $revenueByPeriod = $this->getQuarterlyRevenue($year);
        for ($i = 1; $i <= 4; $i++) {
          $periodLabels[] = "Quý $i";
        }
        break;

      case 'year':
        // Doanh thu theo năm (5 năm gần nhất)
        $revenueByPeriod = $this->getYearlyRevenue($currentYear - 4, $currentYear);
        for ($i = $currentYear - 4; $i <= $currentYear; $i++) {
          $periodLabels[] = "Năm $i";
        }
        break;

      default:
        // Mặc định lấy doanh thu theo tháng
        $revenueByPeriod = $this->getMonthlyRevenue($year);
        for ($i = 1; $i <= 12; $i++) {
          $periodLabels[] = "Tháng $i";
        }
        break;
    }

    // Tổng doanh thu theo cửa hàng
    $revenueByStore = $this->getRevenueByStore($year);
    Log::info('revenueByStore: ' . json_encode($revenueByStore));

    // Tổng doanh thu theo phương thức thanh toán
    $revenueByPaymentMethod = $this->getRevenueByPaymentMethod($year);
    Log::info('revenueByPaymentMethod: ' . json_encode($revenueByPaymentMethod));

    // Tổng doanh thu theo danh mục sản phẩm
    $revenueByCategory = $this->getRevenueByCategory($year);
    Log::info('revenueByCategory: ' . json_encode($revenueByCategory));

    return [
      'periodLabels' => $periodLabels,
      'revenueByPeriod' => $revenueByPeriod,
      'revenueByStore' => $revenueByStore,
      'revenueByPaymentMethod' => $revenueByPaymentMethod,
      'revenueByCategory' => $revenueByCategory,
      'totalRevenue' => array_sum($revenueByPeriod),
      'currentYear' => $currentYear,
      'selectedYear' => $year,
      'selectedPeriod' => $period,
    ];
  }

  /**
   * Lấy thông tin tổng quan về chi phí
   *
   * @param  string|null  $period  Kỳ báo cáo (month, quarter, year, all)
   * @param  int|null  $year  Năm của kỳ báo cáo
   */
  public function getExpenseSummary(?string $period = 'month', ?int $year = null): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;
    $currentYear = Carbon::now()->year;

    // Tổng chi phí theo kỳ
    $expenseByPeriod = [];
    $periodLabels = [];

    switch ($period) {
      case 'month':
        // Chi phí theo tháng (12 tháng gần nhất)
        $expenseByPeriod = $this->getMonthlyExpense($year);
        for ($i = 1; $i <= 12; $i++) {
          $periodLabels[] = "Tháng $i";
        }
        break;

      case 'quarter':
        // Chi phí theo quý (4 quý gần nhất)
        $expenseByPeriod = $this->getQuarterlyExpense($year);
        for ($i = 1; $i <= 4; $i++) {
          $periodLabels[] = "Quý $i";
        }
        break;

      case 'year':
        // Chi phí theo năm (5 năm gần nhất)
        $expenseByPeriod = $this->getYearlyExpense($currentYear - 4, $currentYear);
        for ($i = $currentYear - 4; $i <= $currentYear; $i++) {
          $periodLabels[] = "Năm $i";
        }
        break;

      default:
        // Mặc định lấy chi phí theo tháng
        $expenseByPeriod = $this->getMonthlyExpense($year);
        for ($i = 1; $i <= 12; $i++) {
          $periodLabels[] = "Tháng $i";
        }
        break;
    }

    // Chi phí theo loại (nhập hàng, lương)
    $purchaseExpenses = $this->getPurchaseExpenses($year);
    $payrollExpenses = $this->getPayrollExpenses($year);

    // Tính tổng chi phí
    $totalExpenses = array_sum($expenseByPeriod);

    // Phân bổ chi phí - đảm bảo giá trị là số với ít nhất 0
    $expenseDistribution = [
      ['name' => 'Nhập hàng', 'value' => max((float) $purchaseExpenses, 0)],
      ['name' => 'Lương', 'value' => max((float) $payrollExpenses, 0)],
    ];

    // Loại bỏ các mục có giá trị bằng 0
    $expenseDistribution = array_filter($expenseDistribution, function ($item) {
      return $item['value'] > 0;
    });

    // Chuyển lại thành mảng tuần tự (indexed array)
    $expenseDistribution = array_values($expenseDistribution);

    Log::info('expenseDistribution: ' . json_encode($expenseDistribution));

    return [
      'periodLabels' => $periodLabels,
      'expenseByPeriod' => $expenseByPeriod,
      'expenseDistribution' => $expenseDistribution,
      'purchaseExpenses' => $purchaseExpenses,
      'payrollExpenses' => $payrollExpenses,
      'totalExpenses' => $totalExpenses,
      'currentYear' => $currentYear,
      'selectedYear' => $year,
      'selectedPeriod' => $period,
    ];
  }

  /**
   * Lấy thông tin hiệu suất của các cửa hàng
   *
   * @param  int|null  $year  Năm của kỳ báo cáo
   */
  public function getStorePerformance(?int $year = null): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy thông tin cơ bản của các cửa hàng
    $storeData = DB::table('stores as s')
      ->select([
        's.id',
        's.name',
        's.monthly_target',
        DB::raw('u.full_name as manager_name')
      ])
      ->leftJoin('users as u', function ($join) {
        $join->on('s.manager_id', '=', 'u.id')
          ->where('u.position', '=', 'SM');
      })
      ->orderBy('s.name')
      ->get();

    // Lấy doanh thu thực tế của mỗi cửa hàng
    $storeRevenue = DB::table('orders')
      ->select('store_id', DB::raw('SUM(final_amount) as revenue'))
      ->whereYear('order_date', $year)
      ->where('status', 'completed')
      ->groupBy('store_id')
      ->pluck('revenue', 'store_id')
      ->toArray();

    // Xử lý dữ liệu cho từng cửa hàng
    $storePerformance = [];
    foreach ($storeData as $store) {
      // Lấy chỉ tiêu hàng tháng từ CSDL
      $monthlyTarget = (float) $store->monthly_target;

      // Chỉ tiêu cả năm = chỉ tiêu tháng * 12 tháng
      $annualTarget = $monthlyTarget * 12;

      // Doanh thu thực tế (0 nếu không có dữ liệu)
      $actualRevenue = isset($storeRevenue[$store->id]) ? (float) $storeRevenue[$store->id] : 0;

      // Tính phần trăm hoàn thành
      $percentComplete = $annualTarget > 0 ? round(($actualRevenue / $annualTarget) * 100, 2) : 0;

      // Thêm vào danh sách kết quả
      $storePerformance[] = [
        'id' => $store->id,
        'name' => $store->name,
        'actualRevenue' => $actualRevenue,
        'revenueTarget' => $annualTarget,
        'percentageComplete' => $percentComplete,
        'manager' => $store->manager_name ?? 'Chưa có quản lý',
      ];
    }

    // Sắp xếp theo phần trăm hoàn thành giảm dần
    usort($storePerformance, function ($a, $b) {
      return $b['percentageComplete'] <=> $a['percentageComplete'];
    });

    // Ghi log cho việc debug
    Log::debug('Store Performance Data', [
      'year' => $year,
      'store_targets' => $storeData->pluck('monthly_target', 'id'),
      'store_revenues' => $storeRevenue,
      'processed_data' => array_map(function ($store) {
        return [
          'id' => $store['id'],
          'name' => $store['name'],
          'revenue' => $store['actualRevenue'],
          'target' => $store['revenueTarget'],
          'percent' => $store['percentageComplete'],
        ];
      }, $storePerformance)
    ]);

    return [
      'stores' => $storePerformance,
      'totalStores' => count($storePerformance),
      'selectedYear' => $year,
    ];
  }

  /**
   * Lấy thông tin hiệu suất của các sản phẩm
   *
   * @param  int|null  $year  Năm của kỳ báo cáo
   * @param  int|null  $limit  Giới hạn số lượng sản phẩm trả về
   */
  public function getProductPerformance(?int $year = null, ?int $limit = 10): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy danh sách sản phẩm có doanh số cao nhất
    $topProducts = DB::table('order_items as oi')
      ->join('orders as o', 'oi.order_id', '=', 'o.id')
      ->join('products as p', 'oi.product_id', '=', 'p.id')
      ->join('categories as c', 'p.category_id', '=', 'c.id')
      ->selectRaw('
          p.id,
          p.name,
          c.name as category_name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_sales
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', 'completed')
      ->groupBy('p.id', 'p.name', 'c.name')
      ->orderByDesc('total_sales')
      ->limit($limit)
      ->get()
      ->map(function ($product) {
        // Chuyển đổi các giá trị thành kiểu dữ liệu số đúng
        $product->total_quantity = (int) $product->total_quantity;
        $product->total_sales = (float) $product->total_sales;
        return $product;
      });

    // Lấy danh sách danh mục có doanh số cao nhất
    $topCategories = DB::table('order_items as oi')
      ->join('orders as o', 'oi.order_id', '=', 'o.id')
      ->join('products as p', 'oi.product_id', '=', 'p.id')
      ->join('categories as c', 'p.category_id', '=', 'c.id')
      ->selectRaw('
          c.id,
          c.name,
          SUM(oi.total_price) as total_sales
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', 'completed')
      ->groupBy('c.id', 'c.name')
      ->orderByDesc('total_sales')
      ->get()
      ->map(function ($category) {
        // Chuyển đổi giá trị doanh số thành số float
        $category->total_sales = (float) $category->total_sales;
        return $category;
      });

    return [
      'topProducts' => $topProducts,
      'topCategories' => $topCategories,
      'selectedYear' => $year,
    ];
  }

  /**
   * Lấy thông tin hiệu suất của các nhân viên
   *
   * @param  int|null  $year  Năm của kỳ báo cáo
   * @param  int|null  $limit  Giới hạn số lượng nhân viên trả về
   */
  public function getEmployeePerformance(?int $year = null, ?int $limit = 5): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy danh sách nhân viên có doanh số cao nhất
    $topEmployeesBySales = DB::table('users as u')
      ->join('orders as o', 'u.id', '=', 'o.user_id')
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', '=', 'completed')
      ->whereIn('u.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('total_sales')
      ->limit($limit)
      ->get();

    // Lấy danh sách nhân viên có số lượng đơn hàng cao nhất
    $topEmployeesByCount = DB::table('users as u')
      ->join('orders as o', 'u.id', '=', 'o.user_id')
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', '=', 'completed')
      ->whereIn('u.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('orders_count')
      ->limit($limit)
      ->get();

    // Lấy nhân viên với giá trị đơn hàng trung bình cao nhất
    $topEmployeesByAvgOrder = DB::table('users as u')
      ->join('orders as o', 'u.id', '=', 'o.user_id')
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales,
          SUM(o.final_amount) / COUNT(o.id) as avg_order_value
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', '=', 'completed')
      ->whereIn('u.position', ['SL', 'SA'])
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('avg_order_value')
      ->limit($limit)
      ->get();

    // Lấy dữ liệu số giờ làm việc
    $workingHours = DB::table('attendance_records as ar')
      ->join('shifts as s', 'ar.shift_id', '=', 's.id')
      ->join('users as u', 'ar.user_id', '=', 'u.id')
      ->selectRaw('
          ar.user_id,
          SUM(ar.total_hours) as total_hours
      ')
      ->whereYear('s.date', $year)
      ->where('s.status', '=', 'completed')
      ->whereNotNull('ar.check_in')
      ->whereNotNull('ar.check_out')
      ->whereNotNull('ar.total_hours')
      ->whereIn('u.position', ['SL', 'SA'])
      ->groupBy('ar.user_id')
      ->pluck('total_hours', 'user_id');

    // Lấy doanh số bán hàng
    $salesData = DB::table('orders as o')
      ->join('users as u', 'o.user_id', '=', 'u.id')
      ->selectRaw('
          o.user_id,
          SUM(o.final_amount) as total_sales
      ')
      ->whereYear('o.order_date', $year)
      ->where('o.status', '=', 'completed')
      ->whereIn('u.position', ['SL', 'SA'])
      ->groupBy('o.user_id')
      ->pluck('total_sales', 'user_id');

    // Lấy thông tin cơ bản về nhân viên
    $employeesInfo = DB::table('users')
      ->select('id', 'full_name', 'position', 'store_id')
      ->whereIn('position', ['SL', 'SA'])
      ->get()
      ->keyBy('id');

    // Tính hiệu suất nhân viên (doanh thu / số giờ làm việc)
    $employeePerformance = [];
    foreach ($workingHours as $userId => $hours) {
      // Chỉ xét nhân viên có cả giờ làm và doanh số
      if (isset($salesData[$userId]) && isset($employeesInfo[$userId])) {
        $sales = (float) $salesData[$userId];
        $hours = (float) $hours;

        // Kiểm tra để tránh chia cho 0
        if ($hours > 0 && $sales > 0) {
          $performance = $sales / $hours;
          $employee = $employeesInfo[$userId];

          $employeePerformance[] = [
            'id' => $userId,
            'full_name' => $employee->full_name,
            'position' => $employee->position,
            'store_id' => $employee->store_id,
            'total_hours' => $hours,
            'total_sales' => $sales,
            'performance' => $performance
          ];
        }
      }
    }

    // Sắp xếp theo hiệu suất giảm dần
    usort($employeePerformance, function ($a, $b) {
      return $b['performance'] <=> $a['performance'];
    });

    // Giới hạn số lượng kết quả
    $employeePerformance = array_slice($employeePerformance, 0, $limit);

    // Ghi log dữ liệu để debug
    Log::debug('Employee Performance Data:', [
      'working_hours' => $workingHours,
      'sales_data' => $salesData,
      'top_performance' => $employeePerformance
    ]);

    return [
      'topEmployeesBySales' => $topEmployeesBySales,
      'topEmployeesByCount' => $topEmployeesByCount,
      'topEmployeesByAvgOrder' => $topEmployeesByAvgOrder,
      'employeePerformance' => $employeePerformance,
      'selectedYear' => $year,
    ];
  }

  /**
   * Lấy doanh thu theo tháng
   */
  private function getMonthlyRevenue(int $year): array
  {
    $revenueData = [];

    for ($month = 1; $month <= 12; $month++) {
      $revenue = Order::whereYear('order_date', $year)
        ->whereMonth('order_date', $month)
        ->where('status', 'completed')
        ->sum('final_amount');

      $revenueData[] = $revenue;
    }

    return $revenueData;
  }

  /**
   * Lấy doanh thu theo quý
   */
  private function getQuarterlyRevenue(int $year): array
  {
    $revenueData = [];

    for ($quarter = 1; $quarter <= 4; $quarter++) {
      $startMonth = ($quarter - 1) * 3 + 1;
      $endMonth = $quarter * 3;

      $revenue = Order::whereYear('order_date', $year)
        ->whereRaw('MONTH(order_date) BETWEEN ? AND ?', [$startMonth, $endMonth])
        ->where('status', 'completed')
        ->sum('final_amount');

      $revenueData[] = $revenue;
    }

    return $revenueData;
  }

  /**
   * Lấy doanh thu theo năm
   */
  private function getYearlyRevenue(int $startYear, int $endYear): array
  {
    $revenueData = [];

    for ($year = $startYear; $year <= $endYear; $year++) {
      $revenue = Order::whereYear('order_date', $year)
        ->where('status', 'completed')
        ->sum('final_amount');

      $revenueData[] = $revenue;
    }

    return $revenueData;
  }

  /**
   * Lấy doanh thu theo cửa hàng
   */
  private function getRevenueByStore(int $year): array
  {
    // Lấy dữ liệu doanh thu theo cửa hàng trực tiếp từ database
    $result = DB::table('orders as o')
      ->join('stores as s', 'o.store_id', '=', 's.id')
      ->select([
        's.id',
        's.name',
        DB::raw('SUM(o.final_amount) as revenue')
      ])
      ->whereYear('o.order_date', $year)
      ->where('o.status', 'completed')
      ->groupBy('s.id', 's.name')
      ->having('revenue', '>', 0)
      ->orderBy('revenue', 'desc')
      ->get();

    // Chuyển đổi dữ liệu sang đúng định dạng
    $revenueData = [];
    foreach ($result as $item) {
      $revenueData[] = [
        'name' => $item->name,
        'value' => (float) $item->revenue,
      ];
    }

    // Ghi log dữ liệu để debug
    Log::debug('getRevenueByStore detail:', [
      'raw_data' => $result,
      'formatted_data' => $revenueData
    ]);

    return $revenueData;
  }

  /**
   * Lấy doanh thu theo phương thức thanh toán
   */
  private function getRevenueByPaymentMethod(int $year): array
  {
    $methods = ['cash', 'card', 'transfer'];
    $revenueData = [];

    // Lấy doanh thu theo từng phương thức thanh toán một cách chính xác
    $results = DB::table('orders')
      ->select([
        'payment_method',
        DB::raw('SUM(final_amount) as revenue')
      ])
      ->whereYear('order_date', $year)
      ->where('status', 'completed')
      ->whereIn('payment_method', $methods)
      ->groupBy('payment_method')
      ->get();

    // Chuyển đổi tên phương thức thanh toán sang tiếng Việt và định dạng kết quả
    foreach ($results as $result) {
      $methodName = match ($result->payment_method) {
        'cash' => 'Tiền mặt',
        'card' => 'Thẻ',
        'transfer' => 'Chuyển khoản',
        default => $result->payment_method,
      };

      $revenueData[] = [
        'name' => $methodName,
        'value' => (float) $result->revenue,
      ];
    }

    Log::debug('getRevenueByPaymentMethod detail: ' . json_encode($revenueData));

    return $revenueData;
  }

  /**
   * Lấy doanh thu theo danh mục sản phẩm
   */
  private function getRevenueByCategory(int $year): array
  {
    // Lấy dữ liệu doanh thu theo danh mục sản phẩm trực tiếp từ database
    $result = DB::table('order_items as oi')
      ->join('orders as o', 'oi.order_id', '=', 'o.id')
      ->join('products as p', 'oi.product_id', '=', 'p.id')
      ->join('categories as c', 'p.category_id', '=', 'c.id')
      ->select([
        'c.id',
        'c.name',
        DB::raw('SUM(oi.total_price) as revenue')
      ])
      ->whereYear('o.order_date', $year)
      ->where('o.status', 'completed')
      ->groupBy('c.id', 'c.name')
      ->orderByDesc('revenue')
      ->get();

    // Chuyển đổi dữ liệu sang đúng định dạng
    $revenueData = [];
    foreach ($result as $item) {
      $revenueData[] = [
        'name' => $item->name,
        'value' => (float) $item->revenue,
      ];
    }

    // Ghi log dữ liệu để debug
    Log::debug('getRevenueByCategory detail:', [
      'raw_data' => $result,
      'formatted_data' => $revenueData
    ]);

    return $revenueData;
  }

  /**
   * Lấy chi phí theo tháng
   */
  private function getMonthlyExpense(int $year): array
  {
    $expenseData = [];

    for ($month = 1; $month <= 12; $month++) {
      // Chi phí nhập hàng
      $purchaseExpense = PurchaseOrder::whereYear('order_date', $year)
        ->whereMonth('order_date', $month)
        ->sum('total_amount');

      // Chi phí lương
      $payrollExpense = Payroll::where('year', $year)
        ->where('month', $month)
        ->sum('final_amount');

      $expenseData[] = $purchaseExpense + $payrollExpense;
    }

    return $expenseData;
  }

  /**
   * Lấy chi phí theo quý
   */
  private function getQuarterlyExpense(int $year): array
  {
    $expenseData = [];

    for ($quarter = 1; $quarter <= 4; $quarter++) {
      $startMonth = ($quarter - 1) * 3 + 1;
      $endMonth = $quarter * 3;

      // Chi phí nhập hàng
      $purchaseExpense = PurchaseOrder::whereYear('order_date', $year)
        ->whereRaw('MONTH(order_date) BETWEEN ? AND ?', [$startMonth, $endMonth])
        ->sum('total_amount');

      // Chi phí lương
      $payrollExpense = Payroll::where('year', $year)
        ->whereRaw('month BETWEEN ? AND ?', [$startMonth, $endMonth])
        ->sum('final_amount');

      $expenseData[] = $purchaseExpense + $payrollExpense;
    }

    return $expenseData;
  }

  /**
   * Lấy chi phí theo năm
   */
  private function getYearlyExpense(int $startYear, int $endYear): array
  {
    $expenseData = [];

    for ($year = $startYear; $year <= $endYear; $year++) {
      // Chi phí nhập hàng
      $purchaseExpense = PurchaseOrder::whereYear('order_date', $year)
        ->sum('total_amount');

      // Chi phí lương
      $payrollExpense = Payroll::where('year', $year)
        ->sum('final_amount');

      $expenseData[] = $purchaseExpense + $payrollExpense;
    }

    return $expenseData;
  }

  /**
   * Lấy tổng chi phí nhập hàng
   */
  private function getPurchaseExpenses(int $year): float
  {
    return PurchaseOrder::whereYear('order_date', $year)
      ->sum('total_amount');
  }

  /**
   * Lấy tổng chi phí lương
   */
  private function getPayrollExpenses(int $year): float
  {
    return Payroll::where('year', $year)
      ->sum('final_amount');
  }
}
