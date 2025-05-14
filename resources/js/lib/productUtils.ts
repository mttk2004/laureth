import { Product, ProductStatus } from '@/types/product';

/**
 * Lấy URL đúng cho ảnh từ storage
 */
export function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `/storage/${path}`;
}

/**
 * Format giá tiền theo định dạng tiền tệ Việt Nam
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

/**
 * Lấy text hiển thị cho trạng thái sản phẩm
 */
export function getStatusText(status: ProductStatus): string {
  return status === ProductStatus.ACTIVE ? 'Đang bán' : 'Không bán';
}

/**
 * Lấy class CSS cho trạng thái sản phẩm
 */
export function getStatusClassName(status: ProductStatus): string {
  return status === ProductStatus.ACTIVE
    ? 'bg-active text-active-foreground'
    : 'bg-inactive text-inactive-foreground';
}

/**
 * Các tùy chọn sắp xếp sản phẩm
 */
export enum SortOption {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

/**
 * Lấy label hiển thị cho tùy chọn sắp xếp
 */
export function getSortLabel(option: SortOption): string {
  const labels: Record<SortOption, string> = {
    [SortOption.NEWEST]: 'Mới nhất',
    [SortOption.OLDEST]: 'Cũ nhất',
    [SortOption.NAME_ASC]: 'Tên A-Z',
    [SortOption.NAME_DESC]: 'Tên Z-A',
    [SortOption.PRICE_ASC]: 'Giá tăng dần',
    [SortOption.PRICE_DESC]: 'Giá giảm dần',
  };
  return labels[option];
}

/**
 * Sắp xếp mảng sản phẩm theo tùy chọn đã chọn
 */
export function sortProducts(products: Product[], sortOption: SortOption): Product[] {
  const sortedProducts = [...products];

  switch (sortOption) {
    case SortOption.NEWEST:
      return sortedProducts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case SortOption.OLDEST:
      return sortedProducts.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case SortOption.NAME_ASC:
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case SortOption.NAME_DESC:
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case SortOption.PRICE_ASC:
      return sortedProducts.sort((a, b) => a.price - b.price);
    case SortOption.PRICE_DESC:
      return sortedProducts.sort((a, b) => b.price - a.price);
    default:
      return sortedProducts;
  }
}
