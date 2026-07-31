export interface FanpageItem {
  id: string;
  name: string;
  pageId: string;
  status: "ACTIVE" | "DISABLED" | "PENDING_REVIEW";
  followers: string;
  postsCount: number;
  verification: "BLUE" | "GRAY" | "NONE";
  distribution: string;
  monetization: string;
}

export interface UtilityItem {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}
