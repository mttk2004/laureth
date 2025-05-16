import { ProductStatus } from '@/types/product';

/**
 * Lấy URL đúng cho ảnh từ storage
 */
export function getImageUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
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
    return status === ProductStatus.ACTIVE ? 'bg-active text-active-foreground' : 'bg-inactive text-inactive-foreground';
}
