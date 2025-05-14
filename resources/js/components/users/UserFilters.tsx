import React, { useState } from 'react';
import { FilterIcon, X } from 'lucide-react';
import { Store } from '@/types/store';
import { roleLabels } from '@/types/user';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';

interface UserFiltersProps {
  stores: Store[];
  initialFilters: {
    position?: string;
    store_id?: string;
  };
  onApplyFilters: (filters: { position?: string; store_id?: string }) => void;
}

export default function UserFilters({ stores, initialFilters, onApplyFilters }: UserFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    position: initialFilters.position || 'all',
    store_id: initialFilters.store_id || 'all',
  });

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      position: 'all',
      store_id: 'all',
    });
  };

  const handleApplyFilters = () => {
    const appliedFilters: { position?: string; store_id?: string } = {};

    if (filters.position !== 'all') {
      appliedFilters.position = filters.position;
    }

    if (filters.store_id !== 'all') {
      appliedFilters.store_id = filters.store_id;
    }

    onApplyFilters(appliedFilters);
    setIsOpen(false);
  };

  // Kiểm tra xem đã áp dụng filter nào chưa
  const hasActiveFilters = initialFilters.position || initialFilters.store_id;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"}>
          <FilterIcon className="h-4 w-4 mr-2" />
          Lọc nhân viên {hasActiveFilters && <span className="ml-1 text-xs rounded-full bg-white text-primary w-4 h-4 flex justify-center items-center font-bold">!</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lọc danh sách nhân viên</DialogTitle>
          <DialogDescription>
            Chọn các điều kiện lọc bên dưới và nhấn "Áp dụng" để lọc danh sách nhân viên.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Vị trí
            </Label>
            <Select
              value={filters.position}
              onValueChange={(value) => handleSelectChange('position', value)}
            >
              <SelectTrigger id="position" className="col-span-3">
                <SelectValue placeholder="Tất cả vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vị trí</SelectItem>
                <SelectItem value="SM">{roleLabels.SM}</SelectItem>
                <SelectItem value="SL">{roleLabels.SL}</SelectItem>
                <SelectItem value="SA">{roleLabels.SA}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="store_id" className="text-right">
              Cửa hàng
            </Label>
            <Select
              value={filters.store_id}
              onValueChange={(value) => handleSelectChange('store_id', value)}
            >
              <SelectTrigger id="store_id" className="col-span-3">
                <SelectValue placeholder="Tất cả cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
          <Button type="button" onClick={handleApplyFilters}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
