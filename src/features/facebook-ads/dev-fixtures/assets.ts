export type FacebookAdsAssetType = "page" | "instagram" | "pixel" | "audience" | "media";

export const mockFacebookAdsAssets = [
  { id: "100083457210491", type: "page", name: "LadiPage Việt Nam", owner: "LadiPage Marketing", status: "Sẵn sàng", detail: "238.420 người theo dõi" },
  { id: "109735280481155", type: "page", name: "Nguyễn Phương Marketing", owner: "Nguyễn Phương Agency", status: "Sẵn sàng", detail: "84.130 người theo dõi" },
  { id: "ig_90118420", type: "instagram", name: "@ladipage.vietnam", owner: "LadiPage Việt Nam", status: "Sẵn sàng", detail: "Business account" },
  { id: "px_89432107", type: "pixel", name: "LadiPage Main Pixel", owner: "LadiPage Marketing", status: "Đang nhận dữ liệu", detail: "PageView · Lead · Purchase" },
  { id: "px_60158342", type: "pixel", name: "Ecom Store Dataset", owner: "Ecom Demo Store", status: "Cần kiểm tra", detail: "Không có event trong 24 giờ" },
  { id: "aud_broad_vn", type: "audience", name: "Broad · Việt Nam · 25–44", owner: "LadiPage - Chuyển đổi", status: "Sẵn sàng", detail: "18–22 triệu người" },
  { id: "aud_web_30", type: "audience", name: "Website visitors 30 ngày", owner: "LadiPage Main Pixel", status: "Đang cập nhật", detail: "128.420 người" },
  { id: "media_ugc_01", type: "media", name: "UGC Landing Page 01.mp4", owner: "Marketing", status: "Sẵn sàng", detail: "Video · 1080 × 1920" },
] as const;

