<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryTransferController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderPdfController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductInventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseOrderPdfController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\ShiftManagerController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseInventoryController;
use App\Http\Controllers\WarehousePurchaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Auth::check()
      ? redirect()->route('dashboard')
      : redirect()->route('login');
})->name('home');

// Route cho tất cả user đã đăng nhập
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::get('/notifications', function () {
        return Inertia::render('Others/FeatureOnDeveloping', [
            'user' => Auth::user(),
        ]);
    })->name('notifications');
});

// Route cho DM (District Manager)
Route::middleware(['web', 'auth', 'verified', 'dm'])->group(function () {
    Route::resources([
        'products' => ProductController::class,
        'users' => UserController::class,
        'stores' => StoreController::class,
        'suppliers' => SupplierController::class,
        'warehouses' => WarehouseController::class,
        'purchase-orders' => PurchaseOrderController::class,
    ], [
        'except' => ['show'],
    ]);

    // Route cho payrolls
    Route::get('/payrolls', [PayrollController::class, 'index'])->name('payrolls.index');
    Route::put('/payrolls/{payroll}/approve', [PayrollController::class, 'approve'])->name('payrolls.approve');
    Route::get('/payrolls/create', [PayrollController::class, 'create'])->name('payrolls.create');
    Route::post('/payrolls/generate', [PayrollController::class, 'generate'])->name('payrolls.generate');

    // Route cho warehouse purchase
    Route::get('/warehouses/{warehouse}/purchase', [WarehousePurchaseController::class, 'create'])->name('warehouses.purchase.create');
    Route::post('/warehouses/{warehouse}/purchase', [WarehousePurchaseController::class, 'store'])->name('warehouses.purchase.store');

    // API route để lấy danh sách inventory items của warehouse
    Route::get('/api/warehouses/{warehouse}/inventory', [WarehouseInventoryController::class, 'getInventory']);

    // API route để lấy tổng số lượng của một sản phẩm trong tất cả kho
    Route::get('/api/products/{product}/total-inventory', [ProductInventoryController::class, 'getTotalInventory']);

    // API route để lấy chi tiết các sản phẩm trong đơn nhập hàng
    Route::get('/api/purchase-orders/{purchaseOrder}/items', [PurchaseOrderController::class, 'getItems']);

    // API route để lấy thông tin đầy đủ của đơn nhập hàng
    Route::get('/api/purchase-orders/{purchaseOrder}/details', [PurchaseOrderController::class, 'getDetails']);

    // Route để download PDF đơn nhập hàng
    Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderPdfController::class, 'download'])->name('purchase-orders.download');

    // Routes cho reports (chỉ DM có quyền xem)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/api/reports/revenue-summary', [ReportController::class, 'getRevenueSummary']);
    Route::get('/api/reports/expense-summary', [ReportController::class, 'getExpenseSummary']);
    Route::get('/api/reports/store-performance', [ReportController::class, 'getStorePerformance']);
    Route::get('/api/reports/product-performance', [ReportController::class, 'getProductPerformance']);
});

// Route cho SM (Store Manager)
Route::middleware(['web', 'auth', 'verified', 'sm'])->group(function () {
    // Routes cho quản lý ca làm việc
    Route::get('/shifts-management', [ShiftManagerController::class, 'index'])->name('shifts-management.index');
    Route::get('/shifts-management/create', [ShiftManagerController::class, 'create'])->name('shifts-management.create');
    Route::post('/shifts-management', [ShiftManagerController::class, 'store'])->name('shifts-management.store');
    Route::delete('/shifts-management/{shift}', [ShiftManagerController::class, 'destroy'])->name('shifts-management.destroy');

    // API routes cho quản lý ca làm việc
    Route::get('/api/shifts-management/store-staff', [ShiftManagerController::class, 'getStoreStaff']);
    Route::get('/api/shifts-management/month-shifts', [ShiftManagerController::class, 'getMonthShifts']);
    Route::post('/api/shifts-management/bulk', [ShiftManagerController::class, 'storeBulk'])->name('shifts-management.store-bulk');

    // Routes cho quản lý nhân viên của SM
    Route::get('/staff', [App\Http\Controllers\Staff\StaffController::class, 'index'])->name('staff.index');

    // Routes cho quản lý kho và chuyển kho
    Route::get('/warehouse-management', [InventoryTransferController::class, 'index'])->name('warehouse-management.index');
    Route::get('/api/warehouses/{warehouse}/inventory', [InventoryTransferController::class, 'getWarehouseInventory']);
    Route::post('/api/inventory-transfers', [InventoryTransferController::class, 'store'])->name('inventory-transfers.store');
    Route::put('/api/inventory-transfers/{inventoryTransfer}/status', [InventoryTransferController::class, 'updateStatus'])->name('inventory-transfers.update-status');
    Route::get('/api/inventory-transfers/{inventoryTransfer}', [InventoryTransferController::class, 'getTransferDetail'])->name('inventory-transfers.detail');

    Route::get('/store-reports', function () {
        return Inertia::render('Others/FeatureOnDeveloping', [
            'user' => Auth::user(),
        ]);
    })->name('store-reports');
});

// Route cho nhân viên (SL và SA)
Route::middleware(['web', 'auth', 'verified', 'staff'])->group(function () {
    // Routes cho chức năng chấm công
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');

    // Routes cho chức năng xem ca làm việc
    Route::get('/shift', [ShiftController::class, 'index'])->name('shift.index');

    // Routes cho chức năng POS
    // TODO: Thêm middleware check-active-shift
    // Tạm thời tắt middleware check-active-shift để test
    // Route::middleware(['check-active-shift'])->group(function () {
    Route::get('/pos', [OrderController::class, 'index'])->name('pos.index');
    Route::get('/pos/create', [OrderController::class, 'create'])->name('pos.create');
    Route::post('/pos', [OrderController::class, 'store'])->name('pos.store');
    Route::get('/api/orders/{order}/items', [OrderController::class, 'getItems']);
    Route::get('/api/orders/{order}/details', [OrderController::class, 'getDetails']);
    Route::patch('/api/orders/{order}/update-status', [OrderController::class, 'updateStatus']);
    Route::get('/orders/{order}/download', [OrderPdfController::class, 'download'])->name('orders.download');
    // });

    Route::get('/shift-reports', function () {
        return Inertia::render('Others/FeatureOnDeveloping', [
            'user' => Auth::user(),
        ]);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
