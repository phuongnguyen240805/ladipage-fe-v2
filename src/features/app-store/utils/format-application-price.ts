export function formatVndPrice(price: number): string {
  if (price <= 0) {
    return "Miễn phí";
  }

  return `Từ ${price.toLocaleString("vi-VN")} đ/năm`;
}

export function formatApplicationPrice(
  price: number,
  isInstalled: boolean,
  isUpcoming = false
): string {
  if (isUpcoming) {
    return "Sắp ra mắt";
  }

  if (isInstalled) {
    return "Đã cài đặt";
  }

  return formatVndPrice(price);
}

export function formatInstallCount(count?: number): string | undefined {
  if (count == null || count <= 0) {
    return undefined;
  }

  return count.toLocaleString("vi-VN");
}