import type {
  BillingUsageDto,
  BusinessReportDto,
  CustomersReportDto,
  DashboardSummaryDto,
  OnboardingDto,
  PlanDto,
  SalesReportDto,
  WorkspaceSettingsDto,
} from "@liora/api-types";
import { RESPONSE_SUCCESS_CODE } from "@liora/api-types";

export function resOp<T>(data: T) {
  return { code: RESPONSE_SUCCESS_CODE, message: "success", data };
}

export const mockPlans: PlanDto[] = [
  {
    id: "free",
    name: "Free",
    description: "Gói miễn phí",
    priceIds: {},
    features: ["1 landing page", "0 tên miền"],
    limits: { pages: 1, domains: 0, credits: 100 },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Gói chuyên nghiệp",
    priceIds: { monthly: "price_pro_monthly", yearly: "price_pro_yearly" },
    features: ["50 landing pages", "5 tên miền"],
    limits: { pages: 50, domains: 5, credits: 5000 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Gói doanh nghiệp",
    priceIds: { monthly: "price_ent_monthly" },
    features: ["Không giới hạn"],
    limits: { pages: 9999, domains: 99, credits: 99999 },
  },
];

export const mockBillingUsage: BillingUsageDto = {
  pages: { used: 2, limit: 1 },
  domains: { used: 0, limit: 0 },
  credits: { used: 50, balance: 50, limit: 100 },
  subscriptionTier: "free",
};

export const mockDashboardSummary: DashboardSummaryDto = {
  ordersToday: 3,
  pendingOrders: 2,
  revenueToday: 1250000,
  totalCustomers: 12,
  newCustomersThisWeek: 4,
  subscription: null,
  recentOrders: [
    {
      id: 1,
      code: "DH1001",
      customerName: "Nguyễn Văn An",
      total: 700000,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  ],
  revenueChart: {
    labels: ["10/06", "11/06", "12/06", "13/06", "14/06", "15/06", "16/06"],
    series: [{ name: "Doanh thu 7 ngày", data: [0, 200000, 450000, 0, 800000, 0, 1250000] }],
    summary: { total: 2700000, change: 2700000, changePercent: 100 },
  },
};

export const mockOnboarding: OnboardingDto = {
  steps: [
    { id: "has_product", title: "Thêm sản phẩm đầu tiên", completed: true },
    { id: "has_customer", title: "Thêm khách hàng", completed: true },
    { id: "has_order", title: "Nhận đơn hàng đầu tiên", completed: false },
    { id: "has_completed_order", title: "Hoàn thành đơn hàng", completed: false },
    { id: "has_segment", title: "Tạo phân khúc khách hàng", completed: false },
  ],
  completedCount: 2,
  totalCount: 5,
  progressPercent: 40,
};

const chartLabels = ["01/06", "03/06", "05/06", "07/06", "09/06", "11/06", "13/06"];

export const mockSalesReport: SalesReportDto = {
  revenue: {
    labels: chartLabels,
    series: [
      { name: "Kỳ này", data: [1200000, 3500000, 2100000, 5400000, 4300000, 8900000, 6200000] },
      { name: "Kỳ trước", data: [800000, 1500000, 2400000, 3100000, 3900000, 5200000, 4800000] },
    ],
    summary: { total: 31600000, change: 4200000, changePercent: 15.3 },
  },
  orders: {
    labels: chartLabels,
    series: [
      { name: "Kỳ này", data: [3, 8, 5, 12, 9, 18, 14] },
      { name: "Kỳ trước", data: [2, 4, 6, 8, 10, 11, 10] },
    ],
    summary: { total: 69, change: 8, changePercent: 13.1 },
  },
  aov: {
    labels: chartLabels,
    series: [{ name: "AOV", data: [400000, 437500, 420000, 450000, 477777, 494444, 442857] }],
    summary: { total: 446153, change: 12000, changePercent: 2.8 },
  },
  cancelledOrders: {
    labels: chartLabels,
    series: [{ name: "Đơn hủy", data: [0, 1, 0, 2, 1, 0, 1] }],
    summary: { total: 5, change: -2, changePercent: -28.6 },
  },
};

export const mockBusinessReport: BusinessReportDto = {
  funnel: [
    { stage: "Truy cập", count: 1200, revenue: 0 },
    { stage: "Lead", count: 320, revenue: 0 },
    { stage: "Đơn hàng", count: 69, revenue: 31600000 },
  ],
  topProducts: [
    { productId: 1, name: "Serum TikTok Shop", quantity: 24, revenue: 8400000 },
    { productId: 2, name: "Smartwatch Pro", quantity: 12, revenue: 15000000 },
  ],
  revenue: mockSalesReport.revenue,
};

export const mockCustomersReport: CustomersReportDto = {
  newCustomers: {
    labels: chartLabels,
    series: [{ name: "Khách mới", data: [2, 4, 3, 6, 5, 8, 4] }],
    summary: { total: 32, change: 6, changePercent: 23 },
  },
  returningCustomers: {
    labels: chartLabels,
    series: [{ name: "Khách quay lại", data: [1, 2, 2, 3, 2, 4, 3] }],
    summary: { total: 17, change: 2, changePercent: 13.3 },
  },
  segments: [
    { segmentId: 1, name: "New Subscribers", count: 8 },
    { segmentId: 2, name: "SMS Subscribers", count: 5 },
    { segmentId: 3, name: "Email Subscribers", count: 12 },
  ],
};

export const mockWorkspace: WorkspaceSettingsDto = {
  name: "LadiPage Workspace",
  timezone: "Asia/Ho_Chi_Minh",
  locale: "vi",
};