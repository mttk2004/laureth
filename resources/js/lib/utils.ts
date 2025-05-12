import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Kết hợp các className từ clsx và tailwind-merge để tạo ra className mà không bị xung đột
 * Ví dụ: cn('bg-red-500', isActive && 'bg-blue-500') sẽ trả về 'bg-blue-500' nếu isActive là true
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
