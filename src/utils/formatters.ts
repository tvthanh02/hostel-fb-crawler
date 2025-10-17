// Utility functions để format dữ liệu

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} triệu`;
  }
  return `${(price / 1000).toFixed(0)}k`;
}

export function formatArea(area: number): string {
  return `${area}m²`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  return `${diffMonths} tháng trước`;
}

export function formatPhoneNumber(phone: string): string {
  // Format: 0912 345 678
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

