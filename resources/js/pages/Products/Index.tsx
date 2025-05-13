import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { EyeIcon, TrashIcon, FilterIcon } from 'lucide-react';
import { Product, Category } from '@/types/product';
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
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import DataTable from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface Props {
  products: {
    data: Product[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
  };
  user: User;
  categories: Category[];
  filters?: {
    category_id?: string;
    status?: string;
    price_min?: number;
    price_max?: number;
  };
}

interface FilterOptions {
  category_id: string;
  status: string;
  price_min: number;
  price_max: number;
}

export default function ProductsIndex({ products, user, categories = [], filters = {} }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Khởi tạo giá trị filterOptions từ filters được truyền từ server hoặc giá trị mặc định
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category_id: filters.category_id || 'all',
    status: filters.status || 'all',
    price_min: filters.price_min || 0,
    price_max: filters.price_max || 10000000,
  });

  // Khởi tạo giá trị priceRange từ filters hoặc giá trị mặc định
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price_min || 0,
    filters.price_max || 10000000,
  ]);

  // Cập nhật filterOptions khi filters thay đổi
  useEffect(() => {
    setFilterOptions({
      category_id: filters.category_id || 'all',
      status: filters.status || 'all',
      price_min: filters.price_min || 0,
      price_max: filters.price_max || 10000000,
    });

    setPriceRange([
      filters.price_min || 0,
      filters.price_max || 10000000,
    ]);
  }, [filters]);

  const openDeleteDialog = (productId: number) => {
    setDeleteProductId(productId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteProductId(null);
  };

  const handleDelete = () => {
    if (deleteProductId) {
      router.delete(`/products/${deleteProductId}`, {
        onSuccess: () => {
          closeDeleteDialog();
        },
      });
    }
  };

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
    router.get('/products', {
      category_id: filterOptions.category_id !== 'all' ? filterOptions.category_id : undefined,
      status: filterOptions.status !== 'all' ? filterOptions.status : undefined,
      price_min: filterOptions.price_min > 0 ? filterOptions.price_min : undefined,
      price_max: filterOptions.price_max < 10000000 ? filterOptions.price_max : undefined,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
    setFilterDialogOpen(false);
  };

  const resetFilters = () => {
    setFilterOptions({
      category_id: 'all',
      status: 'all',
      price_min: 0,
      price_max: 10000000,
    });
    setPriceRange([0, 10000000]);
    router.get('/products', {}, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
    setFilterDialogOpen(false);
  };

  // Hàm lấy URL đúng cho ảnh từ storage
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      render: (product: Product) => (
        <div className="flex items-center">
          {product.image && (
            <div className="flex-shrink-0 h-10 w-10 mr-4">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={getImageUrl(product.image)}
                alt={product.name}
              />
            </div>
          )}
          <div className="text-sm font-medium">{product.name}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Danh mục',
      render: (product: Product) => (
        <div className="text-sm">{product.category?.name}</div>
      ),
    },
    {
      key: 'price',
      label: 'Giá',
      render: (product: Product) => (
        <div className="text-sm">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product: Product) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {product.status === 'active' ? 'Đang bán' : 'Không bán'}
        </span>
      ),
    },
  ];

  const renderActions = (product: Product) => (
    <div className="flex space-x-2">
      <Link href={`/products/${product.id}`}>
        <Button variant="ghost" size="sm">
          <EyeIcon className="h-4 w-4" />
          <span className="sr-only">Xem</span>
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openDeleteDialog(product.id)}
      >
        <TrashIcon className="h-4 w-4 text-red-500" />
        <span className="sr-only">Xóa</span>
      </Button>
    </div>
  );

  // Format giá tiền cho hiển thị
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <div className="flex space-x-2">
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Lọc sản phẩm
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Lọc sản phẩm</DialogTitle>
                  <DialogDescription>
                    Chọn các tiêu chí để lọc danh sách sản phẩm.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Danh mục</Label>
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={filterOptions.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Đang bán</SelectItem>
                        <SelectItem value="inactive">Không bán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Khoảng giá</Label>
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
            <Link href="/products/create">
              <Button>Thêm sản phẩm mới</Button>
            </Link>
          </div>
        </div>

        <DataTable
          data={products.data}
          columns={columns}
          actions={renderActions}
          pagination={{
            links: products.links,
            from: products.from,
            to: products.to,
            total: products.total
          }}
        />

        {/* Dialog xác nhận xóa sản phẩm */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
