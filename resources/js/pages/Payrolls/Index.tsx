import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Payroll, PayrollStatus, PayrollSummary, PayrollSortOptionLabels } from '@/types/payroll';
import { Store } from '@/types/store';
import { User, UserRole, roleLabels } from '@/types/user';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { DollarSign, Filter, CheckCircle, CircleDashed, Building, User as UserIcon, Search, Calendar } from 'lucide-react';

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

            <div className="flex items-center gap-2">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <Input
                    placeholder="Tìm theo tên nhân viên"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-80"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                </form>
              </div>

              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Lọc bảng lương</DialogTitle>
                    <DialogDescription>
                      Lọc danh sách bảng lương theo các tiêu chí bên dưới
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Tháng</Label>
                        <Select value={filterData.month} onValueChange={(value) => handleFilterChange('month', value)}>
                          <SelectTrigger id="month">
                            <SelectValue placeholder="Chọn tháng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <SelectItem key={month} value={month.toString()}>
                                Tháng {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Năm</Label>
                        <Select value={filterData.year} onValueChange={(value) => handleFilterChange('year', value)}>
                          <SelectTrigger id="year">
                            <SelectValue placeholder="Chọn năm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {[...new Set(summary.periods.map(p => p.year))].map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                Năm {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select value={filterData.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value={PayrollStatus.PENDING}>Chờ duyệt</SelectItem>
                          <SelectItem value={PayrollStatus.PAID}>Đã thanh toán</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store">Cửa hàng</Label>
                      <Select value={filterData.store_id} onValueChange={(value) => handleFilterChange('store_id', value)}>
                        <SelectTrigger id="store">
                          <SelectValue placeholder="Chọn cửa hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {stores.map(store => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Vị trí</Label>
                      <Select value={filterData.position} onValueChange={(value) => handleFilterChange('position', value)}>
                        <SelectTrigger id="position">
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="SM">Quản lý cửa hàng</SelectItem>
                          <SelectItem value="SL">Trưởng ca</SelectItem>
                          <SelectItem value="SA">Nhân viên bán hàng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={applyFilter}>Áp dụng</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PayrollSortOptionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng lương chờ duyệt</CardTitle>
                <CircleDashed className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalPendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {payrolls.data.filter(p => p.status === PayrollStatus.PENDING).length} phiếu lương
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng lương đã thanh toán</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalPaidAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {payrolls.data.filter(p => p.status === PayrollStatus.PAID).length} phiếu lương
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chọn kỳ lương</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỳ lương" />
                  </SelectTrigger>
                  <SelectContent>
                    {summary.periods.map(period => (
                      <SelectItem key={`${period.month}_${period.year}`} value={`${period.month}_${period.year}`}>
                        Tháng {period.month}/{period.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Nội dung chính */}
          <div>
            <Tabs defaultValue="byStore" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="byStore">Theo cửa hàng</TabsTrigger>
                <TabsTrigger value="byRole">Theo vai trò</TabsTrigger>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
              </TabsList>

              {/* Tab theo cửa hàng */}
              <TabsContent value="byStore">
                <div className="space-y-6">
                  {Object.entries(payrollsByStore).map(([storeId, payrolls]) => {
                    const storeName = storeId === 'unassigned' ? 'Không thuộc cửa hàng' :
                      stores.find(s => s.id === storeId)?.name || 'Không rõ cửa hàng';

                    return (
                      <div key={storeId} className="rounded-lg border p-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                          <Building className="h-5 w-5" />
                          {storeName}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {payrolls.map(payroll => (
                            <PayrollCard
                              key={payroll.id}
                              payroll={payroll}
                              onApprove={handleApprovePayroll}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(payrollsByStore).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Không có dữ liệu bảng lương phù hợp</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab theo vai trò */}
              <TabsContent value="byRole">
                <div className="space-y-6">
                  {summary.payrollByPosition.map(position => {
                    const positionPayrolls = filteredPayrolls.filter(p => p.user?.position === position.position);

                    if (positionPayrolls.length === 0) return null;

                    return (
                      <div key={position.position} className="rounded-lg border p-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                          <UserIcon className="h-5 w-5" />
                          {roleLabels[position.position as UserRole] || position.position}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {positionPayrolls.map(payroll => (
                            <PayrollCard
                              key={payroll.id}
                              payroll={payroll}
                              onApprove={handleApprovePayroll}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Tab tất cả */}
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPayrolls.map(payroll => (
                    <PayrollCard
                      key={payroll.id}
                      payroll={payroll}
                      onApprove={handleApprovePayroll}
                    />
                  ))}

                  {filteredPayrolls.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">Không có dữ liệu bảng lương phù hợp</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pagination */}
          {payrolls.links && payrolls.links.length > 3 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-1">
                {payrolls.links.map((link, i) => {
                  // Skip first and last elements if they are "Previous" and "Next" buttons
                  if (i === 0 || i === payrolls.links.length - 1) return null;

                  const page = link.label === "..."
                    ? null
                    : parseInt(link.label);

                  return (
                    <Button
                      key={i}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9"
                      disabled={!page}
                      onClick={() => page && handlePageChange(page)}
                    >
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface PayrollCardProps {
  payroll: Payroll;
  onApprove: (id: number) => void;
}

function PayrollCard({ payroll, onApprove }: PayrollCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{payroll.user?.full_name || 'Không xác định'}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {roleLabels[payroll.user?.position as UserRole] || payroll.user?.position}
              {payroll.user?.store && ` - ${payroll.user.store.name}`}
            </CardDescription>
          </div>
          <Badge variant={payroll.status === PayrollStatus.PAID ? "default" : "outline"}>
            {payroll.status === PayrollStatus.PAID ? 'Đã thanh toán' : 'Chờ duyệt'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kỳ lương:</span>
            <span className="font-medium">Tháng {payroll.month}/{payroll.year}</span>
          </div>

          {payroll.base_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lương cơ bản:</span>
              <span>{formatCurrency(payroll.base_amount)}</span>
            </div>
          )}

          {payroll.total_hours > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số giờ làm:</span>
              <span>{payroll.total_hours} giờ</span>
            </div>
          )}

          {payroll.commission_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hoa hồng:</span>
              <span>{formatCurrency(payroll.commission_amount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Tổng lương:</span>
            <span className="font-bold text-primary">{formatCurrency(payroll.final_amount)}</span>
          </div>
        </div>
      </CardContent>

      {payroll.status === PayrollStatus.PENDING && (
        <CardFooter className="pt-2">
          <Button
            onClick={() => onApprove(payroll.id)}
            className="w-full"
            size="sm"
          >
            <DollarSign className="h-4 w-4 mr-2" /> Duyệt thanh toán
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
