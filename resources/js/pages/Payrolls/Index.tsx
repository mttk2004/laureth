import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Payroll, PayrollSummary } from '@/types/payroll';
import { Store } from '@/types/store';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import {
  PayrollSummaryCards,
  PayrollFilter,
  PayrollTabs
} from '@/components/payrolls';

interface PageProps {
  payrolls: {
    data: Payroll[];
    current_page: number;
    total: number;
    per_page: number;
  };
  summary: PayrollSummary;
  stores: Store[];
  user: User;
  filters: {
    month?: string;
    year?: string;
    status?: string;
    store_id?: string;
    position?: string;
    name?: string;
  };
  sort: string;
}

interface PayrollsPageProps extends PageProps {
  payrolls: {
    data: Payroll[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    current_page: number;
    total: number;
    per_page: number;
  };
  summary: PayrollSummary;
  stores: Store[];
  user: User;
  filters: {
    month?: string;
    year?: string;
    status?: string;
    store_id?: string;
    position?: string;
    name?: string;
  };
  sort: string;
}

export default function Index({ payrolls, summary, stores, user, filters, sort }: PayrollsPageProps) {
  const { addToast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState(filters.name || '');
  const [filterData, setFilterData] = useState({
    month: filters.month || 'all',
    year: filters.year || 'all',
    status: filters.status || 'all',
    store_id: filters.store_id || 'all',
    position: filters.position || 'all',
  });

  // State cho chọn tháng/năm hiện tại
  const [selectedPeriod, setSelectedPeriod] = useState(
    summary.periods.length > 0 ? `${summary.periods[0].month}_${summary.periods[0].year}` : ''
  );

  // Xử lý thay đổi filter
  const handleFilterChange = (key: string, value: string) => {
    setFilterData(prev => ({ ...prev, [key]: value }));
  };

  // Áp dụng filter
  const applyFilter = () => {
    router.get('/payrolls', {
      ...filterData,
      name: searchFilter,
      sort,
    });
    setIsFilterOpen(false);
  };

  // Reset filter
  const resetFilter = () => {
    const resetData = {
      month: 'all',
      year: 'all',
      status: 'all',
      store_id: 'all',
      position: 'all',
    };
    setFilterData(resetData);
    setSearchFilter('');

    router.get('/payrolls', {
      ...resetData,
      name: '',
      sort,
    });
    setIsFilterOpen(false);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/payrolls', {
      ...filters,
      name: searchFilter,
      sort,
    });
  };

  // Xử lý sắp xếp
  const handleSortChange = (value: string) => {
    router.get('/payrolls', {
      ...filters,
      sort: value,
    });
  };

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    router.get('/payrolls', {
      ...filters,
      sort,
      page,
    });
  };

  // Xử lý duyệt lương
  const handleApprovePayroll = (payrollId: number) => {
    router.put(`/payrolls/${payrollId}/approve`, {}, {
      onSuccess: () => {
        addToast('Đã duyệt thanh toán lương thành công.', 'success');
      },
      onError: () => {
        addToast('Có lỗi xảy ra khi duyệt lương, vui lòng thử lại.', 'error');
      },
    });
  };

  // Filter payrolls hiện tại theo tháng/năm được chọn
  const filteredPayrolls = selectedPeriod
    ? payrolls.data.filter(p => {
        const [month, year] = selectedPeriod.split('_');
        return p.month === parseInt(month) && p.year === parseInt(year);
      })
    : payrolls.data;

  // Tạo nhóm payrolls theo cửa hàng
  const payrollsByStore: Record<string, Payroll[]> = {};
  filteredPayrolls.forEach(payroll => {
    if (payroll.user?.store) {
      const storeId = payroll.user.store.id;
      if (!payrollsByStore[storeId]) {
        payrollsByStore[storeId] = [];
      }
      payrollsByStore[storeId].push(payroll);
    } else {
      // Nhân viên không thuộc cửa hàng nào
      if (!payrollsByStore['unassigned']) {
        payrollsByStore['unassigned'] = [];
      }
      payrollsByStore['unassigned'].push(payroll);
    }
  });

  // Lấy danh sách các năm có trong periods
  const periodYears = [...new Set(summary.periods.map(p => p.year))];

  return (
    <AppLayout user={user}>
      <Head title="Quản lý lương" />

      <div className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quản lý lương</h1>
              <p className="text-muted-foreground">Duyệt và quản lý lương nhân viên</p>
            </div>

            <PayrollFilter
              stores={stores}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              filterData={filterData}
              handleFilterChange={handleFilterChange}
              handleSearch={handleSearch}
              handleSortChange={handleSortChange}
              applyFilter={applyFilter}
              resetFilter={resetFilter}
              sort={sort}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              periodYears={periodYears}
            />
          </div>

          {/* Dashboard Cards */}
          <PayrollSummaryCards
            summary={summary}
            payrolls={payrolls.data}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Nội dung chính */}
          <PayrollTabs
            payrollsByStore={payrollsByStore}
            stores={stores}
            filteredPayrolls={filteredPayrolls}
            payrollByPosition={summary.payrollByPosition}
            handleApprovePayroll={handleApprovePayroll}
            payrolls={payrolls}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </AppLayout>
  );
}
