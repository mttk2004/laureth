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
