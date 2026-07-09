export type UpgradeStep = 1 | 2 | 3 | 4;
export type PlanId = "core" | "grow" | "max";
export type AddonCategoryId = "storage" | "orders" | "customers" | "products";

export type AddonOption = {
  id: string;
  label: string;
  price: number;
  billing: "Theo chu kỳ gói" | "Hàng tháng";
};

export const upgradeSteps: Array<{ id: UpgradeStep; label: string }> = [
  { id: 1, label: "Chọn gói" },
  { id: 2, label: "Addons" },
  { id: 3, label: "Xem lại & thanh toán" },
  { id: 4, label: "Xác nhận" },
];

export const upgradePlans = [
  {
    id: "core" as const,
    name: "CORE",
    price: 3360000,
    description: "Dành cho cá nhân, nhà quảng cáo",
    monthlyLabel: "280.000 đ / tháng quy đổi",
    features: [
      "100 Landing page",
      "10 Tên miền tùy chỉnh",
      "100.000 Lượt truy cập/tháng",
      "10 Tích hợp tài khoản liên kết",
      "100 Đơn hàng/tháng",
      "10 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
  {
    id: "grow" as const,
    name: "GROW",
    price: 5400000,
    description: "Dành cho doanh nghiệp đang phát triển",
    monthlyLabel: "450.000 đ / tháng quy đổi",
    badge: "Best value",
    popular: true,
    features: [
      "1.000 Landing page",
      "50 Tên miền tùy chỉnh",
      "500.000 Lượt truy cập/tháng",
      "30 Tích hợp tài khoản liên kết",
      "250 Đơn hàng/tháng",
      "50 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
  {
    id: "max" as const,
    name: "MAX",
    price: 7200000,
    description: "Gói cao cấp không giới hạn tính năng",
    monthlyLabel: "600.000 đ / tháng quy đổi",
    features: [
      "Không giới hạn Landing page",
      "300 Tên miền tùy chỉnh",
      "Không giới hạn Lượt truy cập/tháng",
      "Không giới hạn Tích hợp tài khoản liên kết",
      "500 Đơn hàng/tháng",
      "300 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
];

export const addonGroups: Array<{
  id: AddonCategoryId;
  title: string;
  subtitle: string;
  badge: AddonOption["billing"];
  icon: "storage" | "orders" | "customers" | "products";
  options: AddonOption[];
}> = [
  {
    id: "storage",
    title: "Dung lượng lưu trữ",
    subtitle: "Mua thêm dung lượng lưu trữ cho tài khoản",
    badge: "Theo chu kỳ gói",
    icon: "storage",
    options: [
      { id: "storage-10", label: "10 GB", price: 120000, billing: "Theo chu kỳ gói" },
      { id: "storage-50", label: "50 GB", price: 420000, billing: "Theo chu kỳ gói" },
      { id: "storage-100", label: "100 GB", price: 720000, billing: "Theo chu kỳ gói" },
    ],
  },
  {
    id: "orders",
    title: "Đơn hàng",
    subtitle: "Nâng giới hạn đơn hàng hàng tháng",
    badge: "Hàng tháng",
    icon: "orders",
    options: [
      { id: "orders-100", label: "100 đơn hàng", price: 0, billing: "Hàng tháng" },
      { id: "orders-200", label: "200 đơn hàng", price: 90000, billing: "Hàng tháng" },
      { id: "orders-500", label: "500 đơn hàng", price: 150000, billing: "Hàng tháng" },
      { id: "orders-1000", label: "1.000 đơn hàng", price: 250000, billing: "Hàng tháng" },
      { id: "orders-2000", label: "2.000 đơn hàng", price: 420000, billing: "Hàng tháng" },
      { id: "orders-3000", label: "3.000 đơn hàng", price: 560000, billing: "Hàng tháng" },
      { id: "orders-5000", label: "5.000 đơn hàng", price: 860000, billing: "Hàng tháng" },
    ],
  },
  {
    id: "customers",
    title: "Khách hàng",
    subtitle: "Mở rộng thêm số khách hàng lưu trữ",
    badge: "Theo chu kỳ gói",
    icon: "customers",
    options: [
      { id: "customers-25k", label: "25.000 khách hàng", price: 360000, billing: "Theo chu kỳ gói" },
      { id: "customers-50k", label: "50.000 khách hàng", price: 720000, billing: "Theo chu kỳ gói" },
      { id: "customers-100k", label: "100.000 khách hàng", price: 1180000, billing: "Theo chu kỳ gói" },
      { id: "customers-125k", label: "125.000 khách hàng", price: 1450000, billing: "Theo chu kỳ gói" },
    ],
  },
  {
    id: "products",
    title: "Sản phẩm",
    subtitle: "Mở rộng số lượng sản phẩm",
    badge: "Theo chu kỳ gói",
    icon: "products",
    options: [
      { id: "products-10", label: "10 sản phẩm", price: 0, billing: "Theo chu kỳ gói" },
      { id: "products-20", label: "20 sản phẩm", price: 160000, billing: "Theo chu kỳ gói" },
      { id: "products-50", label: "50 sản phẩm", price: 320000, billing: "Theo chu kỳ gói" },
      { id: "products-100", label: "100 sản phẩm", price: 520000, billing: "Theo chu kỳ gói" },
    ],
  },
];

export const initialSelectedAddons: Record<AddonCategoryId, string | null> = {
  storage: null,
  orders: "orders-500",
  customers: "customers-50k",
  products: null,
};

export const qrCells = Array.from({ length: 289 }, (_, index) => {
  const x = index % 17;
  const y = Math.floor(index / 17);
  const finder =
    (x < 5 && y < 5) ||
    (x > 11 && y < 5) ||
    (x < 5 && y > 11);
  return finder || (x * 7 + y * 11 + x * y) % 5 < 2;
});

export function formatVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

export function isDomainQuotaBypassEnabled(): boolean {
  return (
    process.env.LANDING_DOMAIN_BYPASS_QUOTA === "true" ||
    process.env.NODE_ENV === "development"
  );
}