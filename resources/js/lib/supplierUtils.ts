import { Supplier } from '@/types/supplier';

/**
 * Format số điện thoại theo định dạng Việt Nam
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Xóa các ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  // Định dạng theo kiểu 0xxx xxx xxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
}

/**
 * Các tùy chọn sắp xếp nhà cung cấp
 */
export enum SortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

/**
 * Lấy label hiển thị cho tùy chọn sắp xếp
 */
export function getSortLabel(option: SortOption): string {
  const labels: Record<SortOption, string> = {
    [SortOption.NAME_ASC]: 'Tên A-Z',
    [SortOption.NAME_DESC]: 'Tên Z-A',
  };
  return labels[option];
}

/**
 * Sắp xếp mảng nhà cung cấp theo tùy chọn đã chọn
 */
export function sortSuppliers(suppliers: Supplier[], sortOption: SortOption): Supplier[] {
  const sortedSuppliers = [...suppliers];

  switch (sortOption) {
    case SortOption.NAME_ASC:
      return sortedSuppliers.sort((a, b) => a.name.localeCompare(b.name));
    case SortOption.NAME_DESC:
      return sortedSuppliers.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sortedSuppliers;
  }
}
