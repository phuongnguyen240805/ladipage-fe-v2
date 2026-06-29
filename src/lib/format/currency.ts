export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? "Tăng" : "Giảm";
  return `${sign} ${Math.abs(percent).toFixed(1)}% so với kỳ trước`;
}