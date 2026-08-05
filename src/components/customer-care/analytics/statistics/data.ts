import type {
  AdsStatisticRow,
  CallCenterStatisticRow,
  PageStatisticRow,
  FeedbackStatisticRow,
  UserStatisticRow,
  TagStatisticRow,
} from "@/components/customer-care/analytics/statistics/types";

export const activityOverviewLabels = [
  "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03",
];

export const activityOverviewSeries = {
  interactions: [12, 18, 15, 21, 28, 22, 31, 35, 42, 39, 51, 46, 58, 61, 67, 74, 82, 78, 91, 96, 103, 98, 112, 124, 119, 131, 146, 152, 168, 184],
  customers: [3, 4, 5, 4, 7, 6, 8, 9, 11, 10, 13, 12, 14, 15, 16, 18, 20, 19, 22, 24, 23, 27, 29, 31, 30, 34, 36, 38, 42, 47],
  orders: [1, 2, 1, 3, 2, 3, 4, 4, 5, 4, 6, 6, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 15, 14, 16, 17, 18, 20, 21, 23],
};

export const conversationHoursSeries = [3, 2, 1, 1, 2, 5, 12, 28, 48, 63, 74, 82, 78, 71, 69, 75, 84, 96, 118, 102, 76, 48, 24, 9];

export const pageStatisticRows: PageStatisticRow[] = [
  { date: "04/08/2026", messages: 1184, comments: 321, interactions: 1505, customers: 268, conversations: 314, responseRate: 96, orders: 57 },
  { date: "03/08/2026", messages: 1098, comments: 298, interactions: 1396, customers: 251, conversations: 302, responseRate: 95, orders: 52 },
  { date: "02/08/2026", messages: 972, comments: 274, interactions: 1246, customers: 232, conversations: 286, responseRate: 93, orders: 46 },
  { date: "01/08/2026", messages: 1040, comments: 287, interactions: 1327, customers: 244, conversations: 293, responseRate: 94, orders: 49 },
  { date: "31/07/2026", messages: 802, comments: 226, interactions: 1028, customers: 201, conversations: 241, responseRate: 92, orders: 38 },
  { date: "30/07/2026", messages: 845, comments: 238, interactions: 1083, customers: 216, conversations: 252, responseRate: 93, orders: 41 },
  { date: "29/07/2026", messages: 710, comments: 194, interactions: 904, customers: 184, conversations: 218, responseRate: 91, orders: 34 },
];

export const userStatisticRows: UserStatisticRow[] = [
  { id: "s1", name: "Mai Anh", avatar: "https://i.pravatar.cc/96?img=47", interactions: 1438, messages: 1186, comments: 252, newConversations: 318, responseRate: 98, avgResponseMinutes: 2.8, orders: 74, revenue: 186400000 },
  { id: "s2", name: "Minh Khang", avatar: "https://i.pravatar.cc/96?img=12", interactions: 1292, messages: 1040, comments: 252, newConversations: 296, responseRate: 96, avgResponseMinutes: 3.4, orders: 68, revenue: 161200000 },
  { id: "s3", name: "Thu Hà", avatar: "https://i.pravatar.cc/96?img=32", interactions: 1186, messages: 957, comments: 229, newConversations: 271, responseRate: 95, avgResponseMinutes: 3.9, orders: 61, revenue: 148500000 },
  { id: "s4", name: "Gia Bảo", avatar: "https://i.pravatar.cc/96?img=5", interactions: 1048, messages: 836, comments: 212, newConversations: 249, responseRate: 93, avgResponseMinutes: 4.6, orders: 54, revenue: 132900000 },
  { id: "s5", name: "Thùy Dương", avatar: "https://i.pravatar.cc/96?img=44", interactions: 936, messages: 748, comments: 188, newConversations: 226, responseRate: 91, avgResponseMinutes: 5.2, orders: 48, revenue: 119600000 },
];

export const tagStatisticRows: TagStatisticRow[] = [
  { id: "t1", name: "Trả hàng", color: "#ef4444", conversations: 184, change: 16 },
  { id: "t2", name: "Kiểm hàng", color: "#64748b", conversations: 162, change: 8 },
  { id: "t3", name: "Câu hỏi", color: "#a855f7", conversations: 149, change: 12 },
  { id: "t4", name: "Mua hàng", color: "#2563eb", conversations: 132, change: 21 },
  { id: "t5", name: "Đã gửi", color: "#16a34a", conversations: 118, change: -4 },
  { id: "t6", name: "Hết hàng", color: "#0ea5e9", conversations: 96, change: -7 },
  { id: "t7", name: "Khách hàng", color: "#dc2626", conversations: 84, change: 3 },
  { id: "t8", name: "Gia đình", color: "#db2777", conversations: 73, change: 9 },
  { id: "t9", name: "Công việc", color: "#f97316", conversations: 65, change: 6 },
  { id: "t10", name: "Bạn bè", color: "#eab308", conversations: 51, change: 2 },
];

export const callCenterStatisticRows: CallCenterStatisticRow[] = [
  { date: "04/08/2026", inbound: 86, outbound: 42, answered: 117, missed: 11, avgSeconds: 224, uniqueCustomers: 94 },
  { date: "03/08/2026", inbound: 79, outbound: 38, answered: 105, missed: 12, avgSeconds: 218, uniqueCustomers: 88 },
  { date: "02/08/2026", inbound: 68, outbound: 34, answered: 91, missed: 11, avgSeconds: 236, uniqueCustomers: 76 },
  { date: "01/08/2026", inbound: 74, outbound: 39, answered: 101, missed: 12, avgSeconds: 211, uniqueCustomers: 82 },
  { date: "31/07/2026", inbound: 63, outbound: 31, answered: 83, missed: 11, avgSeconds: 229, uniqueCustomers: 71 },
];

export const adsStatisticRows: AdsStatisticRow[] = [
  { date: "04/08/2026", campaigns: 12, messages: 438, conversations: 286, customers: 224, orders: 51, revenue: 132400000, conversionRate: 22.8 },
  { date: "03/08/2026", campaigns: 12, messages: 406, conversations: 271, customers: 213, orders: 47, revenue: 121800000, conversionRate: 22.1 },
  { date: "02/08/2026", campaigns: 10, messages: 365, conversations: 244, customers: 192, orders: 42, revenue: 108300000, conversionRate: 21.9 },
  { date: "01/08/2026", campaigns: 10, messages: 382, conversations: 253, customers: 201, orders: 44, revenue: 114700000, conversionRate: 21.8 },
  { date: "31/07/2026", campaigns: 9, messages: 318, conversations: 219, customers: 173, orders: 36, revenue: 93600000, conversionRate: 20.8 },
];

export const feedbackStatisticRows: FeedbackStatisticRow[] = [
  { date: "04/08/2026", total: 168, positive: 139, neutral: 21, negative: 8, average: 4.7 },
  { date: "03/08/2026", total: 152, positive: 124, neutral: 20, negative: 8, average: 4.6 },
  { date: "02/08/2026", total: 141, positive: 113, neutral: 19, negative: 9, average: 4.5 },
  { date: "01/08/2026", total: 146, positive: 119, neutral: 19, negative: 8, average: 4.6 },
  { date: "31/07/2026", total: 128, positive: 101, neutral: 18, negative: 9, average: 4.4 },
];

export const statisticRangeLabels = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  "this-week": "Tuần này",
  "last-week": "Tuần trước",
  "this-month": "Tháng này",
  "last-month": "Tháng trước",
  "7d": "7 ngày",
  "30d": "30 ngày",
  "90d": "90 ngày",
  "180d": "180 ngày",
} as const;

// Compatibility aliases for imports from the first UI clone.
export const activityLabels = activityOverviewLabels;
export const overviewActivity = activityOverviewSeries;
export const hourlyConversations = conversationHoursSeries;
export const dailyPageRows = pageStatisticRows;
export const staffRows = userStatisticRows;
export const tagRows = tagStatisticRows;
export const callRows = callCenterStatisticRows;
export const adRows = adsStatisticRows;
export const ratingRows = feedbackStatisticRows;
export const rangeLabels = statisticRangeLabels;
