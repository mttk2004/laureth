import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';
import { PayrollStatus, PayrollSortOptionLabels } from '@/types/payroll';
import { Store } from '@/types/store';

interface PayrollFilterProps {
  stores: Store[];
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  filterData: {
    month: string;
    year: string;
    status: string;
    store_id: string;
    position: string;
  };
  handleFilterChange: (key: string, value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleSortChange: (value: string) => void;
  applyFilter: () => void;
  sort: string;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  periodYears: number[];
}

export function PayrollFilter({
  stores,
  searchFilter,
  setSearchFilter,
  filterData,
  handleFilterChange,
  handleSearch,
  handleSortChange,
  applyFilter,
  sort,
  isFilterOpen,
  setIsFilterOpen,
  periodYears,
}: PayrollFilterProps) {
  return (
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
                    {periodYears.map(year => (
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
  );
}
