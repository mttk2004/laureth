import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Kết hợp các className từ clsx và tailwind-merge để tạo ra className mà không bị xung đột
 * Ví dụ: cn('bg-red-500', isActive && 'bg-blue-500') sẽ trả về 'bg-blue-500' nếu isActive là true
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format giá tiền theo định dạng tiền tệ Việt Nam
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

/**
 * Format số điện thoại theo định dạng 0900000000
 */
export function formatPhoneNumber(value: string): string {
  return value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}
