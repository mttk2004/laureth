import { Store } from '@/types/store';

/**
 * Format giá tiền theo định dạng tiền tệ Việt Nam
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

/**
 * Các tùy chọn sắp xếp cửa hàng
 */
export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  TARGET_ASC = 'target_asc',
  TARGET_DESC = 'target_desc',
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
    [SortOption.TARGET_ASC]: 'Mục tiêu tăng',
    [SortOption.TARGET_DESC]: 'Mục tiêu giảm',
  };
  return labels[option];
}

/**
 * Sắp xếp mảng cửa hàng theo tùy chọn đã chọn
 */
export function sortStores(stores: Store[], sortOption: SortOption): Store[] {
  const sortedStores = [...stores];

  switch (sortOption) {
    case SortOption.NEWEST:
      return sortedStores.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case SortOption.OLDEST:
      return sortedStores.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case SortOption.NAME_ASC:
      return sortedStores.sort((a, b) => a.name.localeCompare(b.name));
    case SortOption.NAME_DESC:
      return sortedStores.sort((a, b) => b.name.localeCompare(a.name));
    case SortOption.TARGET_ASC:
      return sortedStores.sort((a, b) => Number(a.monthly_target) - Number(b.monthly_target));
    case SortOption.TARGET_DESC:
      return sortedStores.sort((a, b) => Number(b.monthly_target) - Number(a.monthly_target));
    default:
      return sortedStores;
  }
}
