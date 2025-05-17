import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { User, UserRole } from '@/types/user';
import {
    ProductPerformanceCard,
    PieCharts,
    RevenueChart,
    StorePerformanceTable,
    SummaryCards,
    EmployeePerformanceCard
} from '@/components/reports';
import { router } from '@inertiajs/react';

interface TopProduct {
    id: string;
    name: string;
    category_name: string;
    total_quantity: number;
    total_sales: number;
}

interface TopCategory {
    id: number;
    name: string;
    total_sales: number;
}

interface PieChartDataItem {
    name: string;
    value: number;
}

interface StorePerformance {
    id: string;
    name: string;
    actualRevenue: number;
    revenueTarget: number;
    percentageComplete: number;
    manager: string;
}

interface EmployeePerformance {
    id: string;
    full_name: string;
    position: UserRole;
    orders_count: number;
    total_sales: number;
    avg_order_value?: number;
    total_hours?: number;
}

interface ReportsIndexProps {
    user: User;
    revenueSummary: {
        periodLabels: string[];
        revenueByPeriod: number[];
        revenueByStore: PieChartDataItem[];
        revenueByPaymentMethod: PieChartDataItem[];
        revenueByCategory: PieChartDataItem[];
        totalRevenue: number;
        currentYear: number;
        selectedYear: number;
        selectedPeriod: string;
    };
    expenseSummary: {
        periodLabels: string[];
        expenseByPeriod: number[];
        expenseDistribution: PieChartDataItem[];
        purchaseExpenses: number;
        payrollExpenses: number;
        totalExpenses: number;
        currentYear: number;
        selectedYear: number;
        selectedPeriod: string;
    };
    storePerformance: {
        stores: StorePerformance[];
        totalStores: number;
        selectedYear: number;
    };
    productPerformance: {
        topProducts: TopProduct[];
        topCategories: TopCategory[];
        selectedYear: number;
    };
    employeePerformance: {
        topEmployeesBySales: EmployeePerformance[];
        topEmployeesByCount: EmployeePerformance[];
        topEmployeesByAvgOrder: EmployeePerformance[];
        employeePerformance: EmployeePerformance[];
        selectedYear: number;
    };
    period: string;
    year: number;
    years: number[];
}

export default function ReportsIndex({
    user,
    revenueSummary,
    expenseSummary,
    storePerformance,
    productPerformance,
    employeePerformance,
    period,
    year,
    years,
}: ReportsIndexProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [selectedYear, setSelectedYear] = useState(year);

    // Log dữ liệu khi component render
    useEffect(() => {
        console.log('Reports/Index - Props:', {
            revenueSummary,
            expenseSummary,
            storePerformance,
            productPerformance,
            employeePerformance
        });
        console.log('Reports/Index - Các biểu đồ tròn:', {
            revenueByStore: revenueSummary.revenueByStore,
            revenueByPaymentMethod: revenueSummary.revenueByPaymentMethod,
            revenueByCategory: revenueSummary.revenueByCategory,
            expenseDistribution: expenseSummary.expenseDistribution
        });
    }, [revenueSummary, expenseSummary, storePerformance, productPerformance, employeePerformance]);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/reports', { period: newPeriod, year: selectedYear }, { preserveState: true });
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get('/reports', { period: selectedPeriod, year: newYear }, { preserveState: true });
    };

    // Kiểm tra xem dữ liệu biểu đồ có đúng định dạng không
    const validatePieData = (data: unknown): PieChartDataItem[] => {
        if (!data || !Array.isArray(data)) {
            console.error('Dữ liệu biểu đồ không phải là mảng:', data);
            return [];
        }

        // Kiểm tra xem mỗi phần tử có đúng cấu trúc không
        return data.filter(item => {
            if (!item || typeof item !== 'object' || !('name' in item) || !('value' in item)) {
                console.error('Phần tử biểu đồ không đúng cấu trúc:', item);
                return false;
            }
            return true;
        }) as PieChartDataItem[];
    };

    // Xử lý dữ liệu biểu đồ
    const pieChartData = {
        revenueByStore: validatePieData(revenueSummary.revenueByStore),
        revenueByPaymentMethod: validatePieData(revenueSummary.revenueByPaymentMethod),
        revenueByCategory: validatePieData(revenueSummary.revenueByCategory),
        expenseDistribution: validatePieData(expenseSummary.expenseDistribution)
    };

    return (
        <AppLayout user={user}>
            <Head title="Báo cáo thống kê" />

            <div className="py-6">
                <div className="mx-auto max-w-full">
                    <h1 className="mb-6 text-2xl font-bold">Báo cáo thống kê</h1>

                    {/* Thẻ tổng quan */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCards
                            totalRevenue={revenueSummary.totalRevenue}
                            totalExpenses={expenseSummary.totalExpenses}
                            totalStores={storePerformance.totalStores}
                            selectedYear={selectedYear}
                            selectedPeriod={selectedPeriod}
                            onPeriodChange={handlePeriodChange}
                            onYearChange={handleYearChange}
                            years={years}
                        />
                    </div>

                    {/* Biểu đồ chính */}
                    <div className="mb-6">
                        <RevenueChart
                            periodLabels={revenueSummary.periodLabels}
                            revenueByPeriod={revenueSummary.revenueByPeriod}
                            expenseByPeriod={expenseSummary.expenseByPeriod}
                        />
                    </div>

                    {/* Biểu đồ tròn */}
                    <div className="mb-6">
                        <PieCharts
                            revenueByStore={pieChartData.revenueByStore}
                            revenueByPaymentMethod={pieChartData.revenueByPaymentMethod}
                            revenueByCategory={pieChartData.revenueByCategory}
                            expenseDistribution={pieChartData.expenseDistribution}
                        />
                    </div>

                    {/* Bảng hiệu suất cửa hàng */}
                    <div className="mb-6">
                        <StorePerformanceTable stores={storePerformance.stores} />
                    </div>

                    {/* Sản phẩm bán chạy và nhân viên năng suất */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <ProductPerformanceCard topProducts={productPerformance.topProducts} />
                        <EmployeePerformanceCard
                            topEmployeesBySales={employeePerformance.topEmployeesBySales}
                            topEmployeesByCount={employeePerformance.topEmployeesByCount}
                            topEmployeesByAvgOrder={employeePerformance.topEmployeesByAvgOrder}
                            employeePerformance={employeePerformance.employeePerformance}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
