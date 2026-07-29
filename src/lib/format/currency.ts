export function formatVnd(value: number | string): string {
  const num = typeof value === "number" ? value : Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return `${safe.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} đ`;
}

export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? "Tăng" : "Giảm";
  return `${sign} ${Math.abs(percent).toFixed(1)}% so với kỳ trước`;
}