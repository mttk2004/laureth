import React, { useState } from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/types/user';

interface FilterValues {
  manager_id?: string;
  has_manager?: boolean;
}

interface StoreFiltersProps {
  managers: User[];
  initialFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export default function StoreFilters({ managers, initialFilters, onApplyFilters }: StoreFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset if closed without applying
      setFilters(initialFilters);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {};
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    setOpen(false);
  };

  const hasActiveFilters = Object.keys(initialFilters).length > 0;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={hasActiveFilters ? 'border-[#06f] text-[#06f]' : ''}
      >
        <FilterIcon className="h-3.5 w-3.5 mr-2" />
        Bộ lọc
        {hasActiveFilters && (
          <span className="ml-1 rounded-full bg-[#06f] text-white w-5 h-5 flex items-center justify-center text-xs">
            {Object.keys(initialFilters).length}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lọc cửa hàng</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Quản lý</Label>
              <Select
                value={filters.manager_id || "all_managers"}
                onValueChange={(value) => handleFilterChange('manager_id', value === "all_managers" ? undefined : value)}
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Tất cả quản lý" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_managers">Tất cả quản lý</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-manager"
                checked={!!filters.has_manager}
                onCheckedChange={(checked) =>
                  handleFilterChange('has_manager', checked === true ? true : undefined)
                }
              />
              <Label htmlFor="has-manager">Chỉ hiện cửa hàng đã có quản lý</Label>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Đặt lại
            </Button>
            <Button onClick={handleApply}>Áp dụng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
