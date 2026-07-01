import type { AppItem } from "@/features/app-store/types";

export type AppRegistryEntry = {
  code: string;
  feId: string;
  name: string;
  route: string;
  iconName: AppItem["iconName"];
  category: AppItem["category"];
  description: string;
  tags?: string[];
  upcoming?: boolean;
};

export const APP_REGISTRY: AppRegistryEntry[] = [
  {
    code: "WebsiteBuilder",
    feId: "1",
    name: "Website Builder",
    route: "/landing-pages",
    iconName: "website",
    category: "sales",
    description:
      "Giúp người dùng dễ dàng tạo ra trang web chuyên nghiệp và hiệu quả cho doanh nghiệp.",
  },
  {
    code: "Ecommerce",
    feId: "2",
    name: "Ecom Store",
    route: "/ban-hang",
    iconName: "store",
    category: "sales",
    description:
      "Tạo nhanh trang thanh toán và bán hàng trực tuyến cho sản phẩm, dịch vụ, khoá học.",
  },
  {
    code: "Automation",
    feId: "5",
    name: "Dynamic",
    route: "/automation",
    iconName: "dynamic",
    category: "marketing",
    description:
      "Các chiến dịch để nhắm đến từng phân khúc khách hàng phù hợp cho mục đích của bạn.",
  },
  {
    code: "ELearning",
    feId: "6",
    name: "E-Learning",
    route: "/e-learning",
    iconName: "elearning",
    category: "sales",
    description:
      "Số hoá kiến thức thành khoá học online — đào tạo nội bộ hoặc bán khoá học kiếm tiền.",
  },
  {
    code: "FacebookAds",
    feId: "10",
    name: "Facebook Ads",
    route: "/facebook-ads/tai-khoan-qc",
    iconName: "fbads",
    category: "marketing",
    description:
      "Công cụ quản lý chiến dịch quảng cáo Facebook, tối ưu hóa ngân sách và đo lường báo cáo hiệu quả thời gian thực.",
  },
  {
    code: "CloudPhone",
    feId: "14",
    name: "CloudPhone",
    route: "/cloudphone/cua-hang-cho-thue",
    iconName: "cloudphone",
    category: "marketing",
    description:
      "Cửa hàng thuê cloud phone, quản lý thiết bị và điều khiển đồng bộ nhiều máy theo nhóm cho automation.",
  },
  {
    code: "OfferKit",
    feId: "15",
    name: "OfferKit",
    route: "/offerkit",
    iconName: "offerkit",
    category: "marketing",
    description:
      "Ứng dụng quản lý ưu đãi, mã giảm giá, voucher, referral và loyalty cho chiến dịch Marketing và E-Learning.",
  },
  {
    code: "AiSeo",
    feId: "17",
    name: "AI SEO",
    route: "/ai-seo",
    iconName: "seo",
    category: "marketing",
    description:
      "Tự động hóa dự án SEO, theo dõi tiến độ công việc, hướng dẫn cài đặt và giám sát thu thập dữ liệu (crawl).",
    tags: ["SEO Automation", "Crawl Monitor"],
  },
  {
    code: "SiteMetrics",
    feId: "18",
    name: "Site Metrics",
    route: "/site-metrics",
    iconName: "metrics",
    category: "marketing",
    description:
      "Tổng quan tên miền, đo lường các chỉ số hiển thị lượng truy cập, điểm số kiểm tra và sức khỏe kỹ thuật.",
    tags: ["Domain Audit", "Traffic Metrics"],
  },
  {
    code: "Local",
    feId: "19",
    name: "Local",
    route: "/local",
    iconName: "local",
    category: "marketing",
    description:
      "Quản lý Google Business Profile, bản đồ xếp hạng khu vực và kiểm tra danh mục trích dẫn (citation).",
    tags: ["Google Maps", "Local SEO"],
  },
  {
    code: "Content",
    feId: "20",
    name: "Content",
    route: "/content",
    iconName: "content",
    category: "content",
    description:
      "Trợ lý viết bài Content Assistant, xây dựng Topical Maps, chấm điểm Semantic Grader và viết lại bằng AI.",
    tags: ["Content AI", "Topical Maps"],
  },
  {
    code: "Keywords",
    feId: "21",
    name: "Keywords",
    route: "/keywords",
    iconName: "keywords",
    category: "content",
    description:
      "Cơ sở dữ liệu nghiên cứu từ khóa, đo lường độ khó từ khóa và ước lượng khối lượng tìm kiếm.",
    tags: ["Keywords Research", "Search Volume"],
  },
  {
    code: "Reports",
    feId: "22",
    name: "Reports",
    route: "/bao-cao",
    iconName: "reports",
    category: "marketing",
    description:
      "Trình tạo báo cáo SEO tùy chỉnh, tích hợp số liệu Google Search Console và tự động gửi PDF định kỳ.",
    tags: ["Report Builder", "GSC Integration"],
  },
  {
    code: "Authority",
    feId: "23",
    name: "Authority",
    route: "/authority",
    iconName: "authority",
    category: "upcoming",
    description:
      "Theo dõi lịch sử backlink, phân tích tên miền giới thiệu và các công cụ tiếp cận xây dựng liên kết.",
    tags: ["Backlinks Track", "Link Building"],
    upcoming: true,
  },
];

const registryByCode = new Map(APP_REGISTRY.map((entry) => [entry.code, entry]));
const registryByFeId = new Map(APP_REGISTRY.map((entry) => [entry.feId, entry]));

export function getRegistryByCode(code: string): AppRegistryEntry | undefined {
  return registryByCode.get(code);
}

export function getRegistryByFeId(feId: string): AppRegistryEntry | undefined {
  return registryByFeId.get(feId);
}

export function getRouteForFeId(feId: string): string | undefined {
  return registryByFeId.get(feId)?.route;
}