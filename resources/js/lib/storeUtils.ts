/**
 * Format giá tiền theo định dạng tiền tệ Việt Nam
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}
