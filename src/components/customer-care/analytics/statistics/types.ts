export type StatisticView =
  | "overview"
  | "page"
  | "user"
  | "engagement"
  | "tag"
  | "call-center"
  | "ads"
  | "feedback"
  | "export";

export type StatisticRangePreset =
  | "today"
  | "yesterday"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "7d"
  | "30d"
  | "90d"
  | "180d";

export interface StatisticSeriesPoint {
  label: string;
  value: number;
}

export interface UserStatisticRow {
  id: string;
  name: string;
  avatar: string;
  interactions: number;
  messages: number;
  comments: number;
  newConversations: number;
  responseRate: number;
  avgResponseMinutes: number;
  orders: number;
  revenue: number;
}

export interface PageStatisticRow {
  date: string;
  messages: number;
  comments: number;
  interactions: number;
  customers: number;
  conversations: number;
  responseRate: number;
  orders: number;
}

export interface TagStatisticRow {
  id: string;
  name: string;
  color: string;
  conversations: number;
  change: number;
}

export interface CallCenterStatisticRow {
  date: string;
  inbound: number;
  outbound: number;
  answered: number;
  missed: number;
  avgSeconds: number;
  uniqueCustomers: number;
}

export interface AdsStatisticRow {
  date: string;
  campaigns: number;
  messages: number;
  conversations: number;
  customers: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}

export interface FeedbackStatisticRow {
  date: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
}

// Compatibility aliases for code created in the first CSKH prototype.
export type StatisticsView = StatisticView;
export type StatisticsRange = StatisticRangePreset;
export type SeriesPoint = StatisticSeriesPoint;
export type StaffRow = UserStatisticRow;
export type DailyPageRow = PageStatisticRow;
export type TagRow = TagStatisticRow;
export type CallRow = CallCenterStatisticRow;
export type AdRow = AdsStatisticRow;
export type RatingRow = FeedbackStatisticRow;
