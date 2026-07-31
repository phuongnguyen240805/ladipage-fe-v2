import {
  Activity,
  AlarmClock,
  BarChart3,
  Blocks,
  Bot,
  CircleDollarSign,
  Copy,
  FileChartColumn,
  FilterX,
  Gauge,
  GitCompareArrows,
  HeartPulse,
  Layers3,
  Link2,
  ListChecks,
  Megaphone,
  MousePointerClick,
  PauseCircle,
  RefreshCcw,
  Route,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  TrendingUp,
  WandSparkles,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export type AdsTool = {
  slug: string;
  name: string;
  description: string;
  category: "Ngân sách" | "Ra mắt & quản lý" | "Sáng tạo & phân tích" | "Sức khỏe" | "Tracking";
  icon: LucideIcon;
  tone: "blue" | "green" | "orange" | "purple";
};

export const adsTools: AdsTool[] = [
  { slug: "budget-overview", name: "Tổng quan ngân sách", description: "Phân bổ và mức sử dụng ngân sách theo tài khoản.", category: "Ngân sách", icon: CircleDollarSign, tone: "blue" },
  { slug: "budget-burndown", name: "Budget burndown", description: "Theo dõi tốc độ tiêu theo ngày và phần còn lại.", category: "Ngân sách", icon: TrendingUp, tone: "green" },
  { slug: "budget-waste-finder", name: "Tìm chi tiêu lãng phí", description: "Phát hiện nhóm tiêu tiền nhưng chưa tạo kết quả.", category: "Ngân sách", icon: FilterX, tone: "orange" },
  { slug: "scheduled-budget-rules", name: "Quy tắc ngân sách", description: "Lập lịch tăng, giảm hoặc giữ ngân sách.", category: "Ngân sách", icon: AlarmClock, tone: "purple" },
  { slug: "spend-forecast", name: "Dự báo chi tiêu", description: "Mô phỏng chi tiêu đến cuối kỳ theo tốc độ hiện tại.", category: "Ngân sách", icon: BarChart3, tone: "blue" },
  { slug: "campaign-cloner", name: "Nhân bản chiến dịch", description: "Sao chép cấu trúc sang tài khoản hoặc thị trường khác.", category: "Ra mắt & quản lý", icon: Copy, tone: "purple" },
  { slug: "bulk-launcher", name: "Bulk launcher", description: "Chuẩn bị nhiều chiến dịch từ một bảng cấu hình.", category: "Ra mắt & quản lý", icon: Megaphone, tone: "blue" },
  { slug: "launch-templates", name: "Mẫu ra mắt", description: "Lưu cấu trúc campaign, ad set và quảng cáo dùng lại.", category: "Ra mắt & quản lý", icon: Layers3, tone: "green" },
  { slug: "live-stats", name: "Live stats", description: "Bảng nhịp nhanh cho các chỉ số quan trọng.", category: "Sáng tạo & phân tích", icon: Activity, tone: "green" },
  { slug: "creative-analyzer", name: "Creative analyzer", description: "So sánh hiệu quả hình ảnh, video và định dạng.", category: "Sáng tạo & phân tích", icon: ScanSearch, tone: "purple" },
  { slug: "creative-refresh-planner", name: "Kế hoạch làm mới creative", description: "Xếp lịch thay creative dựa trên tần suất và CTR.", category: "Sáng tạo & phân tích", icon: RefreshCcw, tone: "blue" },
  { slug: "ad-copy-fatigue", name: "Mỏi nội dung quảng cáo", description: "Tìm nội dung giảm tương tác theo thời gian.", category: "Sáng tạo & phân tích", icon: FileChartColumn, tone: "orange" },
  { slug: "ad-rotation-checker", name: "Kiểm tra vòng quay quảng cáo", description: "Phát hiện phân phối lệch giữa các quảng cáo.", category: "Sáng tạo & phân tích", icon: GitCompareArrows, tone: "blue" },
  { slug: "ai-ad-copy", name: "AI Ad Copy", description: "Tạo biến thể nội dung từ thông điệp sản phẩm.", category: "Sáng tạo & phân tích", icon: Bot, tone: "purple" },
  { slug: "winning-ad-detector", name: "Phát hiện quảng cáo thắng", description: "Xếp hạng quảng cáo dựa trên nhiều chỉ số.", category: "Sáng tạo & phân tích", icon: Sparkles, tone: "green" },
  { slug: "cta-performance", name: "Hiệu suất CTA", description: "So sánh nút kêu gọi hành động theo mục tiêu.", category: "Sáng tạo & phân tích", icon: MousePointerClick, tone: "blue" },
  { slug: "ab-test-tracker", name: "Theo dõi A/B test", description: "Gom giả thuyết, biến thể và mức tin cậy.", category: "Sáng tạo & phân tích", icon: TestTube2, tone: "purple" },
  { slug: "performance-alerts", name: "Cảnh báo hiệu suất", description: "Theo dõi thay đổi bất thường của CPA, ROAS và spend.", category: "Sức khỏe", icon: HeartPulse, tone: "orange" },
  { slug: "delivery-troubleshooter", name: "Chẩn đoán phân phối", description: "Kiểm tra nguyên nhân campaign không phân phối.", category: "Sức khỏe", icon: WandSparkles, tone: "purple" },
  { slug: "account-health", name: "Sức khỏe tài khoản", description: "Tổng hợp cảnh báo, hạn mức và trạng thái tài sản.", category: "Sức khỏe", icon: ShieldCheck, tone: "green" },
  { slug: "campaign-health-score", name: "Điểm sức khỏe chiến dịch", description: "Chấm điểm cấu trúc, phân phối và hiệu quả.", category: "Sức khỏe", icon: Gauge, tone: "blue" },
  { slug: "campaign-lifecycle", name: "Vòng đời chiến dịch", description: "Nhận diện giai đoạn học, tăng trưởng và bão hòa.", category: "Sức khỏe", icon: Route, tone: "purple" },
  { slug: "cbo-analyzer", name: "CBO analyzer", description: "Đánh giá phân bổ ngân sách giữa các ad set.", category: "Sức khỏe", icon: Blocks, tone: "blue" },
  { slug: "cpa-trend-tracker", name: "Xu hướng CPA", description: "Phát hiện CPA tăng hoặc giảm bền vững.", category: "Sức khỏe", icon: TrendingUp, tone: "orange" },
  { slug: "cross-account-benchmark", name: "Benchmark đa tài khoản", description: "So sánh hiệu quả theo ngành và tài khoản.", category: "Sức khỏe", icon: GitCompareArrows, tone: "green" },
  { slug: "smart-pause-recommender", name: "Gợi ý tạm dừng", description: "Đề xuất mục nên dừng theo ngưỡng kiểm soát.", category: "Sức khỏe", icon: PauseCircle, tone: "orange" },
  { slug: "funnel-dropoff", name: "Funnel drop-off", description: "Tìm bước rơi nhiều nhất từ click đến mua hàng.", category: "Tracking", icon: Route, tone: "purple" },
  { slug: "cost-per-milestone", name: "Chi phí theo cột mốc", description: "Tính chi phí cho view, lead, checkout và purchase.", category: "Tracking", icon: Target, tone: "blue" },
  { slug: "inactive-assets", name: "Tài sản không hoạt động", description: "Rà soát pixel, page và audience ít sử dụng.", category: "Tracking", icon: ListChecks, tone: "orange" },
  { slug: "pixel", name: "Meta Pixel", description: "Kiểm tra tín hiệu sự kiện và chất lượng match.", category: "Tracking", icon: Webhook, tone: "green" },
  { slug: "capi-settings", name: "Conversions API", description: "Theo dõi cấu hình server event và deduplication.", category: "Tracking", icon: Link2, tone: "purple" },
  { slug: "utm-builder", name: "UTM Builder", description: "Tạo quy ước UTM nhất quán cho chiến dịch.", category: "Tracking", icon: MousePointerClick, tone: "blue" },
];

export const adsToolCategories = [
  "Ngân sách",
  "Ra mắt & quản lý",
  "Sáng tạo & phân tích",
  "Sức khỏe",
  "Tracking",
] as const;

export function getAdsTool(slug: string) {
  return adsTools.find((tool) => tool.slug === slug);
}
