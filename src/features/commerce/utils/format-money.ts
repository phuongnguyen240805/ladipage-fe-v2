export function formatCommerceMoney(
  amount: number,
  currencyCode = "vnd",
): string {
  const code = currencyCode.toUpperCase();
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: code === "VND" ? "VND" : code,
      maximumFractionDigits: code === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("vi-VN")} ${code}`;
  }
}

export function formatCommerceDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
