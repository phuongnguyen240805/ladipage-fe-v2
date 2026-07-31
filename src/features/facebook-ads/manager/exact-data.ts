export type Workspace = "AD" | "BM" | "PAGE" | "CAMP";

export type AdAccountRow = {
  id: string;
  status: "Hoạt động" | "Đã đóng" | "Vô hiệu" | "Đang duyệt";
  ownerId: string;
  name: string;
  balance: number;
  threshold: string;
  thresholdRemaining: string;
  limit: number;
  spendCap: string;
  spend: number;
  admins: string;
  role: string;
  currency: string;
  type: string;
  card: string;
  nextBill: string;
  timezone: string;
  createdAt: string;
};

export const adAccountRows: AdAccountRow[] = [
  {
    id: "1735653450733646",
    status: "Đã đóng",
    ownerId: "100054946470494",
    name: "Nguyễn Phương",
    balance: 0,
    threshold: "—",
    thresholdRemaining: "—",
    limit: 1_912_733,
    spendCap: "Không giới hạn",
    spend: 0,
    admins: "1(0)",
    role: "QTV",
    currency: "VND",
    type: "Personal",
    card: "—",
    nextBill: "2026-07-30",
    timezone: "+2 | Europe/Brussels",
    createdAt: "2026-03-22",
  },
  {
    id: "1601536444838708",
    status: "Hoạt động",
    ownerId: "100054946470494",
    name: "Nguyễn Phương",
    balance: 0,
    threshold: "—",
    thresholdRemaining: "—",
    limit: 1_322_541,
    spendCap: "Không giới hạn",
    spend: 0,
    admins: "1(0)",
    role: "QTV",
    currency: "VND",
    type: "Personal",
    card: "—",
    nextBill: "2026-07-30",
    timezone: "+7 | Asia/Ho_Chi_Minh",
    createdAt: "2026-07-28",
  },
  {
    id: "328194205018734",
    status: "Hoạt động",
    ownerId: "100091842746310",
    name: "LadiPage - Chuyển đổi",
    balance: 12_480_000,
    threshold: "5.000.000đ",
    thresholdRemaining: "2.120.000đ",
    limit: 4_500_000,
    spendCap: "50.000.000đ",
    spend: 18_640_000,
    admins: "4(1)",
    role: "QTV",
    currency: "VND",
    type: "Business",
    card: "Visa •••• 4821",
    nextBill: "2026-08-03",
    timezone: "+7 | Asia/Ho_Chi_Minh",
    createdAt: "2025-11-17",
  },
];

export const bmRows = [
  { id: "104725908311240", name: "LadiPage Marketing", status: "Hoạt động", level: "Business", adAccounts: 18, pages: 12, admins: 4, verified: "Đã xác minh", limit: 25, createdAt: "2024-08-16" },
  { id: "108294756330184", name: "Nguyễn Phương Agency", status: "Hoạt động", level: "Business", adAccounts: 7, pages: 9, admins: 2, verified: "Chưa xác minh", limit: 10, createdAt: "2025-03-11" },
  { id: "112048993752611", name: "Ecom Demo Store", status: "Hạn chế", level: "Business", adAccounts: 3, pages: 2, admins: 1, verified: "Đang xem xét", limit: 5, createdAt: "2026-01-22" },
];

export const pageRows = [
  { id: "100083457210491", name: "LadiPage Việt Nam", bm: "LadiPage Marketing", status: "Đã đăng", followers: 238_420, promotable: "Có", category: "Phần mềm", admins: 4, createdAt: "2018-06-21" },
  { id: "109735280481155", name: "Nguyễn Phương Marketing", bm: "Nguyễn Phương Agency", status: "Đã đăng", followers: 84_130, promotable: "Có", category: "Dịch vụ marketing", admins: 2, createdAt: "2022-10-08" },
  { id: "114820394771201", name: "Ecom Demo Store", bm: "Ecom Demo Store", status: "Hạn chế", followers: 19_840, promotable: "Không", category: "Mua sắm", admins: 1, createdAt: "2025-09-15" },
];

export type CampaignLevel = "campaign" | "adset" | "ad";
export const campaignRows = [
  { id: "1202318400123101", level: "campaign", name: "LDP | Lead | Broad | T07", account: "LadiPage - Chuyển đổi", status: "Hoạt động", objective: "Khách hàng tiềm năng", budget: 2_500_000, spend: 7_840_000, results: 214, cpr: 36_636, reach: 286_310, ctr: 2.84, roas: 4.26 },
  { id: "1202318400123102", level: "campaign", name: "Ecom | Retarget | Purchase", account: "Ecom Store", status: "Hoạt động", objective: "Doanh số", budget: 1_800_000, spend: 5_620_000, results: 98, cpr: 57_347, reach: 194_220, ctr: 3.18, roas: 5.12 },
  { id: "1202318400123103", level: "campaign", name: "Brand | Video Views | Always-on", account: "LadiPage - Chuyển đổi", status: "Tạm dừng", objective: "Tương tác", budget: 900_000, spend: 2_760_000, results: 128, cpr: 21_562, reach: 297_860, ctr: 1.42, roas: 0 },
  { id: "1202318400224101", level: "adset", name: "HN + HCM | 25–44 | Broad", account: "LadiPage - Chuyển đổi", status: "Hoạt động", objective: "Chuyển đổi", budget: 1_250_000, spend: 4_180_000, results: 126, cpr: 33_174, reach: 164_280, ctr: 3.06, roas: 4.48 },
  { id: "1202318400224102", level: "adset", name: "Lookalike Lead 1% | Việt Nam", account: "LadiPage - Chuyển đổi", status: "Hoạt động", objective: "Chuyển đổi", budget: 1_250_000, spend: 3_660_000, results: 88, cpr: 41_590, reach: 122_030, ctr: 2.58, roas: 4.02 },
  { id: "1202318400325101", level: "ad", name: "UGC 01 | Nỗi đau vận hành landing page", account: "LadiPage - Chuyển đổi", status: "Hoạt động", objective: "Video 9:16", budget: 0, spend: 2_360_000, results: 84, cpr: 28_095, reach: 96_410, ctr: 3.44, roas: 4.72 },
  { id: "1202318400325102", level: "ad", name: "Static 02 | 3 bước tạo landing page", account: "LadiPage - Chuyển đổi", status: "Đang duyệt", objective: "Ảnh đơn", budget: 0, spend: 0, results: 0, cpr: 0, reach: 0, ctr: 0, roas: 0 },
];
