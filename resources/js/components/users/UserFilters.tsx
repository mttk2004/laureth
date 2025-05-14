import React, { useState } from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { roleLabels } from '@/types/user';
import { Store } from '@/types/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterOptions {
  position: string;
  store_id: string;
}

interface UserFiltersProps {
  stores: Store[];
  initialFilters: Partial<FilterOptions>;
  onApplyFilters: (filters: Partial<FilterOptions>) => void;
}

export default function UserFilters({ stores, initialFilters, onApplyFilters }: UserFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    position: initialFilters.position || 'all',
    store_id: initialFilters.store_id || 'all',
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    onApplyFilters({
      position: filterOptions.position !== 'all' ? filterOptions.position : undefined,
      store_id: filterOptions.store_id !== 'all' ? filterOptions.store_id : undefined,
    });
    setOpen(false);
  };

  const resetFilters = () => {
    setFilterOptions({
      position: 'all',
      store_id: 'all',
    });
    onApplyFilters({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="h-4 w-4 mr-2" />
          Lọc nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lọc nhân viên</DialogTitle>
          <DialogDescription>
            Chọn các tiêu chí để lọc danh sách nhân viên.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="position">Vai trò</Label>
            <Select
              value={filterOptions.position}
              onValueChange={(value) => handleFilterChange('position', value)}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="DM">{roleLabels.DM}</SelectItem>
                <SelectItem value="SM">{roleLabels.SM}</SelectItem>
                <SelectItem value="SL">{roleLabels.SL}</SelectItem>
                <SelectItem value="SA">{roleLabels.SA}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store">Cửa hàng</Label>
            <Select
              value={filterOptions.store_id}
              onValueChange={(value) => handleFilterChange('store_id', value)}
            >
              <SelectTrigger id="store">
                <SelectValue placeholder="Chọn cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetFilters}>
            Đặt lại
          </Button>
          <Button onClick={applyFilters}>
            Áp dụng bộ lọc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
