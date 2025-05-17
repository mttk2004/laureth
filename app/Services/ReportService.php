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
   * @param string|null $period Kỳ báo cáo (month, quarter, year, all)
   * @param int|null $year Năm của kỳ báo cáo
   * @return array
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
   * @param string|null $period Kỳ báo cáo (month, quarter, year, all)
   * @param int|null $year Năm của kỳ báo cáo
   * @return array
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
      ['name' => 'Nhập hàng', 'value' => max((float)$purchaseExpenses, 0)],
      ['name' => 'Lương', 'value' => max((float)$payrollExpenses, 0)],
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
   * @param int|null $year Năm của kỳ báo cáo
   * @return array
   */
  public function getStorePerformance(?int $year = null): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy danh sách tất cả các cửa hàng
    $stores = Store::all();

    $storePerformance = [];

    foreach ($stores as $store) {
      // Tính doanh thu thực tế của cửa hàng
      $actualRevenue = Order::where('store_id', $store->id)
        ->whereYear('order_date', $year)
        ->where('status', 'completed')
        ->sum('final_amount');

      // Tính chỉ tiêu doanh thu (dựa vào monthly_target)
      $revenueTarget = $store->monthly_target * 12;

      // Tính phần trăm hoàn thành chỉ tiêu
      $percentageComplete = $revenueTarget > 0 ? round(($actualRevenue / $revenueTarget) * 100, 2) : 0;

      $storePerformance[] = [
        'id' => $store->id,
        'name' => $store->name,
        'actualRevenue' => $actualRevenue,
        'revenueTarget' => $revenueTarget,
        'percentageComplete' => $percentageComplete,
        'manager' => $store->manager_id ? $store->manager->full_name : 'Chưa có quản lý',
      ];
    }

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
   * @param int|null $year Năm của kỳ báo cáo
   * @param int|null $limit Giới hạn số lượng sản phẩm trả về
   * @return array
   */
  public function getProductPerformance(?int $year = null, ?int $limit = 10): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy danh sách sản phẩm có doanh số cao nhất
    $topProducts = DB::table('order_items')
      ->join('orders', 'order_items.order_id', '=', 'orders.id')
      ->join('products', 'order_items.product_id', '=', 'products.id')
      ->join('categories', 'products.category_id', '=', 'categories.id')
      ->selectRaw('
                products.id,
                products.name,
                categories.name as category_name,
                SUM(order_items.quantity) as total_quantity,
                SUM(order_items.total_price) as total_sales
            ')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', 'completed')
      ->groupBy('products.id', 'products.name', 'categories.name')
      ->orderByDesc('total_sales')
      ->limit($limit)
      ->get();

    // Lấy danh sách danh mục có doanh số cao nhất
    $topCategories = DB::table('order_items')
      ->join('orders', 'order_items.order_id', '=', 'orders.id')
      ->join('products', 'order_items.product_id', '=', 'products.id')
      ->join('categories', 'products.category_id', '=', 'categories.id')
      ->selectRaw('
                categories.id,
                categories.name,
                SUM(order_items.total_price) as total_sales
            ')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', 'completed')
      ->groupBy('categories.id', 'categories.name')
      ->orderByDesc('total_sales')
      ->get();

    return [
      'topProducts' => $topProducts,
      'topCategories' => $topCategories,
      'selectedYear' => $year,
    ];
  }

  /**
   * Lấy thông tin hiệu suất của các nhân viên
   *
   * @param int|null $year Năm của kỳ báo cáo
   * @param int|null $limit Giới hạn số lượng nhân viên trả về
   * @return array
   */
  public function getEmployeePerformance(?int $year = null, ?int $limit = 5): array
  {
    // Nếu không chỉ định năm thì lấy năm hiện tại
    $year = $year ?? Carbon::now()->year;

    // Lấy danh sách nhân viên có doanh số cao nhất
    $topEmployeesBySales = DB::table('orders')
      ->join('users', 'orders.user_id', '=', 'users.id')
      ->selectRaw('
          users.id,
          users.full_name,
          users.position,
          COUNT(orders.id) as orders_count,
          SUM(orders.final_amount) as total_sales
      ')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', '=', 'completed')
      ->whereIn('users.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->groupBy('users.id', 'users.full_name', 'users.position')
      ->orderByDesc('total_sales')
      ->limit($limit)
      ->get();

    // Lấy danh sách nhân viên có số lượng đơn hàng cao nhất
    $topEmployeesByCount = DB::table('orders')
      ->join('users', 'orders.user_id', '=', 'users.id')
      ->selectRaw('
          users.id,
          users.full_name,
          users.position,
          COUNT(orders.id) as orders_count,
          SUM(orders.final_amount) as total_sales
      ')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', '=', 'completed')
      ->whereIn('users.position', ['SL', 'SA']) // Chỉ lấy nhân viên bán hàng và trưởng ca
      ->groupBy('users.id', 'users.full_name', 'users.position')
      ->orderByDesc('orders_count')
      ->limit($limit)
      ->get();

    // Lấy nhân viên với giá trị đơn hàng trung bình cao nhất
    $topEmployeesByAvgOrder = DB::table('orders')
      ->join('users', 'orders.user_id', '=', 'users.id')
      ->selectRaw('
          users.id,
          users.full_name,
          users.position,
          COUNT(orders.id) as orders_count,
          SUM(orders.final_amount) as total_sales,
          AVG(orders.final_amount) as avg_order_value
      ')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', '=', 'completed')
      ->whereIn('users.position', ['SL', 'SA'])
      ->groupBy('users.id', 'users.full_name', 'users.position')
      ->orderByDesc('avg_order_value')
      ->limit($limit)
      ->get();

    // Tính hiệu suất cho mỗi nhân viên (doanh thu / số giờ làm việc)
    $employeePerformance = DB::table('users')
      ->selectRaw('
          users.id,
          users.full_name,
          users.position,
          users.store_id,
          (SELECT SUM(TIMESTAMPDIFF(HOUR, ar.check_in, ar.check_out))
           FROM attendance_records ar
           WHERE ar.user_id = users.id
           AND YEAR(ar.check_in) = ?
           AND ar.check_in IS NOT NULL
           AND ar.check_out IS NOT NULL) as total_hours,
          (SELECT SUM(o.final_amount)
           FROM orders o
           WHERE o.user_id = users.id
           AND YEAR(o.order_date) = ?
           AND o.status = \'completed\') as total_sales
      ')
      ->whereIn('users.position', ['SL', 'SA'])
      ->addBinding([$year, $year], 'select')
      ->havingRaw('total_hours > 0 AND total_sales > 0')
      ->orderByRaw('total_sales / total_hours DESC')
      ->limit($limit)
      ->get();

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
        ->whereRaw("MONTH(order_date) BETWEEN ? AND ?", [$startMonth, $endMonth])
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
    $stores = Store::all();
    $revenueData = [];

    foreach ($stores as $store) {
      $revenue = Order::where('store_id', $store->id)
        ->whereYear('order_date', $year)
        ->where('status', 'completed')
        ->sum('final_amount');

      // Chỉ thêm vào nếu có doanh thu
      if ($revenue > 0) {
        $revenueData[] = [
          'name' => $store->name,
          'value' => (float)$revenue,
        ];
      }
    }

    // Sắp xếp theo doanh thu giảm dần
    usort($revenueData, function ($a, $b) {
      return $b['value'] <=> $a['value'];
    });

    // Chuyển lại thành mảng tuần tự (indexed array)
    $revenueData = array_values($revenueData);

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

    foreach ($methods as $method) {
      $revenue = Order::whereYear('order_date', $year)
        ->where('payment_method', $method)
        ->where('status', 'completed')
        ->sum('final_amount');

      $methodName = match ($method) {
        'cash' => 'Tiền mặt',
        'card' => 'Thẻ',
        'transfer' => 'Chuyển khoản',
        default => $method,
      };

      // Chỉ thêm vào nếu có doanh thu
      if ($revenue > 0) {
        $revenueData[] = [
          'name' => $methodName,
          'value' => (float)$revenue,
        ];
      }
    }

    // Chuyển lại thành mảng tuần tự (indexed array)
    $revenueData = array_values($revenueData);

    Log::debug('getRevenueByPaymentMethod detail: ' . json_encode($revenueData));
    return $revenueData;
  }

  /**
   * Lấy doanh thu theo danh mục sản phẩm
   */
  private function getRevenueByCategory(int $year): array
  {
    $results = DB::table('order_items')
      ->join('orders', 'order_items.order_id', '=', 'orders.id')
      ->join('products', 'order_items.product_id', '=', 'products.id')
      ->join('categories', 'products.category_id', '=', 'categories.id')
      ->selectRaw('categories.name, SUM(order_items.total_price) as value')
      ->whereYear('orders.order_date', $year)
      ->where('orders.status', 'completed')
      ->groupBy('categories.name')
      ->orderByDesc('value')
      ->get();

    // Chuyển đổi từ collection sang mảng với đúng cấu trúc
    $data = [];
    foreach ($results as $item) {
      $data[] = [
        'name' => $item->name,
        'value' => (float) $item->value,
      ];
    }

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
        ->whereRaw("MONTH(order_date) BETWEEN ? AND ?", [$startMonth, $endMonth])
        ->sum('total_amount');

      // Chi phí lương
      $payrollExpense = Payroll::where('year', $year)
        ->whereRaw("month BETWEEN ? AND ?", [$startMonth, $endMonth])
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
