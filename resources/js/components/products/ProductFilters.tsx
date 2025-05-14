import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/productUtils';
import { Category, ProductStatus } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BaseFilterDialog from '@/components/common/BaseFilterDialog';
import BaseFilterForm, { BaseFilterRow } from '@/components/common/BaseFilterForm';

interface FilterOptions {
  category_id: string;
  status: string;
  price_min: number;
  price_max: number;
}

interface ProductFiltersProps {
  categories: Category[];
  initialFilters: Partial<FilterOptions>;
  onApplyFilters: (filters: Partial<FilterOptions>) => void;
}

export default function ProductFilters({ categories, initialFilters, onApplyFilters }: ProductFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category_id: initialFilters.category_id || 'all',
    status: initialFilters.status || 'all',
    price_min: initialFilters.price_min || 0,
    price_max: initialFilters.price_max || 10000000,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.price_min || 0,
    initialFilters.price_max || 10000000,
  ]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setFilterOptions((prev) => ({
      ...prev,
      price_min: values[0],
      price_max: values[1],
    }));
  };

  const applyFilters = () => {
    onApplyFilters({
      category_id: filterOptions.category_id !== 'all' ? filterOptions.category_id : undefined,
      status: filterOptions.status !== 'all' ? filterOptions.status : undefined,
      price_min: filterOptions.price_min > 0 ? filterOptions.price_min : undefined,
      price_max: filterOptions.price_max < 10000000 ? filterOptions.price_max : undefined,
    });
  };

  const resetFilters = () => {
    setFilterOptions({
      category_id: 'all',
      status: 'all',
      price_min: 0,
      price_max: 10000000,
    });
    setPriceRange([0, 10000000]);
    onApplyFilters({});
  };

  const hasActiveFilters = Boolean(
    initialFilters.category_id ||
    initialFilters.status ||
    initialFilters.price_min ||
    initialFilters.price_max
  );

  return (
    <BaseFilterDialog
      title="Lọc sản phẩm"
      description="Chọn các tiêu chí để lọc danh sách sản phẩm."
      onApply={applyFilters}
      onReset={resetFilters}
      hasActiveFilters={hasActiveFilters}
      triggerText="Lọc sản phẩm"
      dialogWidth="sm:max-w-md"
    >
      <BaseFilterForm>
        <BaseFilterRow label="Danh mục" labelPosition="top">
          <Select
            value={filterOptions.category_id}
            onValueChange={(value) => handleFilterChange('category_id', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BaseFilterRow>

        <BaseFilterRow label="Trạng thái" labelPosition="top">
          <Select
            value={filterOptions.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={ProductStatus.ACTIVE}>Đang bán</SelectItem>
              <SelectItem value={ProductStatus.INACTIVE}>Không bán</SelectItem>
            </SelectContent>
          </Select>
        </BaseFilterRow>

        <BaseFilterRow label="Khoảng giá" labelPosition="top">
          <div className="space-y-4">
            <div className="pt-5 pb-2">
              <Slider
                defaultValue={priceRange}
                max={10000000}
                step={100000}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
              />
            </div>
            <div className="flex justify-between items-center">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPriceRange([value, priceRange[1]]);
                  handleFilterChange('price_min', value);
                }}
                className="w-[45%]"
              />
              <span>đến</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPriceRange([priceRange[0], value]);
                  handleFilterChange('price_max', value);
                }}
                className="w-[45%]"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
        </BaseFilterRow>
      </BaseFilterForm>
    </BaseFilterDialog>
  );
}
