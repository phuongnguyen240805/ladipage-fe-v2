export interface BusinessManager {
  id: string;
  name: string;
  bmId: string;
  status: "ACTIVE" | "DISABLED" | "PENDING_REVIEW";
  limit: string;
  pagesCount: number;
  partnersCount: number;
  adminsCount: number;
  instagramCount: number;
  whatsappCount: number;
  paymentMethod: string;
}

export interface UtilityItem {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}
