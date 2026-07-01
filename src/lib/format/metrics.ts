export function formatMetricVi(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.max(0, value));
}