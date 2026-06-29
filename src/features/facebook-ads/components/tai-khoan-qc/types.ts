export interface AdsAccount {
  id: string;
  name: string;
  uid: string;
  status: "ACTIVE" | "DISABLED" | "PENDING_REVIEW";
  type: "PERSONAL" | "BM";
  balance: string;
  threshold: string;
  limit: string;
  currency: string;
  role: string;
  paymentMethod: string;
}

export interface UtilityItem {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}
