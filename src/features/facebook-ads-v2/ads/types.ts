export type AdsAccountStatus = "ACTIVE" | "DISABLED" | "PENDING_REVIEW";
export type AdsAccountType = "PERSONAL" | "BM";

export type AdsAccountRow = {
  id: string;
  accountId?: string;
  adId?: string;
  accountName?: string;
  name?: string;
  uid?: string;
  bmId?: string;
  businessId?: string;
  status?: AdsAccountStatus | string | number;
  account_status?: number;
  accountStatus?: number | string;
  type?: AdsAccountType | string;
  balance?: string | number;
  threshold?: string | number;
  thresholdAmount?: string | number;
  adLimit?: string | number;
  limit?: string | number;
  totalSpent?: string | number;
  amount_spent?: string | number;
  currency?: string;
  currencyCode?: string;
  role?: string;
  paymentMethod?: string;
  paymentMethodSummary?: string;
  processStatus?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type LoadAdsAccountsOptions = {
  sourceType: "all" | "by-id" | "by-bm";
  accountFilter: "all" | "personal" | "bm";
  limit: number;
  dataOptions: {
    financial: boolean;
    insights: boolean;
    adminRights: boolean;
    timestamps: boolean;
    hiddenAccounts: boolean;
    payments: boolean;
  };
};
