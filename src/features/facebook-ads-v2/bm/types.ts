export type BusinessManagerStatus = "ACTIVE" | "DISABLED" | "PENDING_REVIEW";

export type BusinessManagerRow = {
  id: string;
  uid?: string;
  name?: string;
  bmId?: string;
  businessId?: string;
  business_id?: string;
  status?: BusinessManagerStatus | string | number;
  statusLabel?: string;
  account_status?: number;
  limit?: string | number;
  adtrust_dsl?: string | number;
  pagesCount?: number;
  pageCount?: number;
  pages?: unknown;
  page?: unknown;
  partnersCount?: number;
  partnerCount?: number;
  partners?: unknown;
  partner?: unknown;
  adminsCount?: number;
  adminCount?: number;
  admins?: unknown;
  admin?: unknown;
  instagramCount?: number;
  instagram?: unknown;
  whatsappCount?: number;
  whatsapp?: unknown;
  bmAccountCount?: number;
  bmAccount?: unknown;
  paymentMethod?: string;
  paymentMethodSummary?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type LoadBusinessManagersOptions = {
  sourceType: "all" | "by-id";
  bmFilter: "all" | "active" | "disabled";
  limit: number;
  dataOptions: {
    status: boolean;
    page: boolean;
    limit: boolean;
    bmAccount: boolean;
    partner: boolean;
    admin: boolean;
    instagram: boolean;
    whatsapp: boolean;
    share: boolean;
  };
};
