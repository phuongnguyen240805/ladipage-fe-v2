export const mockFacebookAdsConnections = [
  {
    id: "meta-conn-01",
    owner: "Nguyễn Phương",
    metaUserId: "100054946470494",
    accounts: 3,
    businesses: 3,
    pages: 3,
    expires: "Còn 46 ngày",
    lastSync: "2 phút trước",
  },
  {
    id: "meta-conn-02",
    owner: "LadiPage Marketing",
    metaUserId: "100091842746310",
    accounts: 18,
    businesses: 1,
    pages: 12,
    expires: "Cần cấp lại quyền",
    lastSync: "2 ngày trước",
  },
] as const;

export const mockFacebookAdsRequiredScopes = [
  ["ads_read", "Đọc tài khoản, chiến dịch và insights", true],
  ["ads_management", "Tạo và cập nhật quảng cáo", true],
  ["business_management", "Đọc tài sản Business Manager", true],
  ["pages_show_list", "Liệt kê Fanpage được cấp quyền", true],
  ["instagram_basic", "Đọc danh tính Instagram", false],
] as const;

