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

    // Sử dụng Query Builder để lấy dữ liệu từ database một cách chính xác
    $storePerformance = DB::table('stores as s')
      ->leftJoin('users as u', function ($join) {
        $join->on('s.manager_id', '=', 'u.id')
          ->where('u.position', '=', 'SM');
      })
      ->leftJoin('orders as o', function ($join) use ($year) {
        $join->on('s.id', '=', 'o.store_id')
          ->whereYear('o.order_date', $year)
          ->where('o.status', '=', 'completed');
      })
      ->select([
        's.id',
        's.name',
        's.monthly_target',
        DB::raw('u.full_name as manager'),
        DB::raw('SUM(o.final_amount) as actualRevenue')
      ])
      ->groupBy('s.id', 's.name', 's.monthly_target', 'u.full_name')
      ->get()
      ->map(function ($store) {
        // Đảm bảo actualRevenue không null
        $actualRevenue = $store->actualRevenue ?? 0;

        // Tính chỉ tiêu doanh thu cả năm (monthly_target * 12)
        $revenueTarget = $store->monthly_target * 12;

        // Tính phần trăm hoàn thành chỉ tiêu
        $percentageComplete = $revenueTarget > 0 ? round(($actualRevenue / $revenueTarget) * 100, 2) : 0;

        return [
          'id' => $store->id,
          'name' => $store->name,
          'actualRevenue' => (float) $actualRevenue,
          'revenueTarget' => (float) $revenueTarget,
          'percentageComplete' => $percentageComplete,
          'manager' => $store->manager ?? 'Chưa có quản lý',
        ];
      })
      ->toArray();

    // Sắp xếp theo phần trăm hoàn thành giảm dần
    usort($storePerformance, function ($a, $b) {
      return $b['percentageComplete'] <=> $a['percentageComplete'];
    });

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
      ->leftJoin('orders as o', function ($join) use ($year) {
        $join->on('u.id', '=', 'o.user_id')
          ->whereYear('o.order_date', $year)
          ->where('o.status', '=', 'completed');
      })
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales
      ')
      ->whereIn('u.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->whereNotNull('o.id') // Chỉ lấy nhân viên có đơn hàng
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('total_sales')
      ->limit($limit)
      ->get();

    // Lấy danh sách nhân viên có số lượng đơn hàng cao nhất
    $topEmployeesByCount = DB::table('users as u')
      ->leftJoin('orders as o', function ($join) use ($year) {
        $join->on('u.id', '=', 'o.user_id')
          ->whereYear('o.order_date', $year)
          ->where('o.status', '=', 'completed');
      })
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales
      ')
      ->whereIn('u.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->whereNotNull('o.id') // Chỉ lấy nhân viên có đơn hàng
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('orders_count')
      ->limit($limit)
      ->get();

    // Lấy nhân viên với giá trị đơn hàng trung bình cao nhất
    $topEmployeesByAvgOrder = DB::table('users as u')
      ->leftJoin('orders as o', function ($join) use ($year) {
        $join->on('u.id', '=', 'o.user_id')
          ->whereYear('o.order_date', $year)
          ->where('o.status', '=', 'completed');
      })
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          COUNT(o.id) as orders_count,
          SUM(o.final_amount) as total_sales,
          CASE WHEN COUNT(o.id) > 0 THEN SUM(o.final_amount) / COUNT(o.id) ELSE 0 END as avg_order_value
      ')
      ->whereIn('u.position', ['SL', 'SA'])
      ->whereNotNull('o.id') // Chỉ lấy nhân viên có đơn hàng
      ->groupBy('u.id', 'u.full_name', 'u.position')
      ->orderByDesc('avg_order_value')
      ->limit($limit)
      ->get();

    // Cải thiện tính hiệu suất cho mỗi nhân viên (doanh thu / số giờ làm việc)
    $employeePerformance = DB::table('users as u')
      ->selectRaw('
          u.id,
          u.full_name,
          u.position,
          u.store_id,
          (SELECT SUM(ar.total_hours)
           FROM attendance_records ar
           JOIN shifts s ON ar.shift_id = s.id
           WHERE ar.user_id = u.id
           AND YEAR(s.date) = ?
           AND s.status = "completed"
           AND ar.total_hours IS NOT NULL) as total_hours,
          (SELECT SUM(o.final_amount)
           FROM orders o
           WHERE o.user_id = u.id
           AND YEAR(o.order_date) = ?
           AND o.status = "completed") as total_sales
      ')
      ->whereIn('u.position', ['SL', 'SA'])
      ->addBinding([$year, $year], 'select')
      ->havingRaw('total_hours > 0 AND total_sales > 0')
      ->orderByRaw('total_sales / total_hours DESC')
      ->limit($limit)
      ->get();

    // Chuyển đổi các giá trị số sang đúng kiểu dữ liệu
    $employeePerformance = collect($employeePerformance)->map(function ($employee) {
      $employee->total_hours = (float) $employee->total_hours;
      $employee->total_sales = (float) $employee->total_sales;
      return $employee;
    });

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
    // Sử dụng Query Builder để lấy dữ liệu từ database một cách chính xác
    $results = DB::table('stores as s')
      ->leftJoin('orders as o', function ($join) use ($year) {
        $join->on('s.id', '=', 'o.store_id')
          ->whereYear('o.order_date', $year)
          ->where('o.status', '=', 'completed');
      })
      ->select([
        's.id',
        's.name',
        DB::raw('SUM(o.final_amount) as revenue')
      ])
      ->groupBy('s.id', 's.name')
      ->having('revenue', '>', 0)
      ->orderBy('revenue', 'desc')
      ->get();

    // Chuyển đổi từ collection sang mảng với đúng cấu trúc
    $revenueData = $results->map(function ($item) {
      return [
        'name' => $item->name,
        'value' => (float) $item->revenue,
      ];
    })->toArray();

    Log::debug('getRevenueByStore detail: ' . json_encode($revenueData));

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
    $results = DB::table('order_items as oi')
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

    // Chuyển đổi từ collection sang mảng với đúng cấu trúc
    $data = $results->map(function ($item) {
      return [
        'name' => $item->name,
        'value' => (float) $item->revenue,
      ];
    })->toArray();

    Log::debug('getRevenueByCategory detail: ' . json_encode($data));

    return $data;
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
