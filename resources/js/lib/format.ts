/**
 * Format thời gian từ chuỗi ISO date hoặc Date object sang định dạng hh:mm
 */
export function formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format thời gian từ chuỗi ISO date hoặc Date object sang định dạng dd/MM/yyyy hh:mm
 */
export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('vi-VN');
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
}

/**
 * Format ngày tháng từ chuỗi ISO date hoặc Date object sang định dạng dd/MM/yyyy
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
}

/**
 * Format số tiền sang định dạng tiền tệ VNĐ
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format số lượng với đơn vị
 */
export function formatQuantity(quantity: number, unit: string = 'cái'): string {
    return `${quantity.toLocaleString('vi-VN')} ${unit}`;
}
