import { Head } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import {
    ProductPerformanceCard,
    PieCharts,
    RevenueChart,
    StorePerformanceTable,
    SummaryCards
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
    period,
    year,
    years,
}: ReportsIndexProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [selectedYear, setSelectedYear] = useState(year);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/reports', { period: newPeriod, year: selectedYear }, { preserveState: true });
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get('/reports', { period: selectedPeriod, year: newYear }, { preserveState: true });
    };

    return (
        <AppLayout user={user}>
            <Head title="Báo cáo thống kê" />

            <div className="py-6">
                <div className="mx-auto">
                    <h1 className="mb-6 text-2xl font-bold">Báo cáo thống kê</h1>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

                        <RevenueChart
                            periodLabels={revenueSummary.periodLabels}
                            revenueByPeriod={revenueSummary.revenueByPeriod}
                            expenseByPeriod={expenseSummary.expenseByPeriod}
                        />

                        <PieCharts
                            revenueByStore={revenueSummary.revenueByStore}
                            revenueByPaymentMethod={revenueSummary.revenueByPaymentMethod}
                            revenueByCategory={revenueSummary.revenueByCategory}
                            expenseDistribution={expenseSummary.expenseDistribution}
                        />

                        <StorePerformanceTable stores={storePerformance.stores} />

                        <ProductPerformanceCard topProducts={productPerformance.topProducts} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
