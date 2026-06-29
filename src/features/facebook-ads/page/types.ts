export type FanpageStatus = "ACTIVE" | "DISABLED" | "PENDING_REVIEW";
export type FanpageVerification = "BLUE" | "GRAY" | "NONE";

export type FanpageRow = {
  id: string;
  uid?: string;
  name?: string;
  pageId?: string;
  page_id?: string;
  pageId2?: string;
  status?: FanpageStatus | string | number;
  statusLabel?: string;
  followers?: string | number;
  followers_count?: string | number;
  likes?: string | number;
  postCount?: string | number;
  postsCount?: string | number;
  verification?: string;
  pageLive?: string;
  distribution?: string;
  brandedContent?: string;
  monetization?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type LoadFanpagesOptions = {
  sourceType: "all" | "mine" | "by-bm" | "by-id";
  pageFilter: "all" | "active" | "disabled";
  limit: number;
  dataOptions: {
    status: boolean;
    badge: boolean;
    likes: boolean;
    posts: boolean;
    live: boolean;
    monetize: boolean;
  };
};
