export type LandingPageItem = {
  id: string;
  name: string;
  templateId?: string;
  status: "PUBLISHED" | "UNPUBLISHED";
  updatedAt: string;
  views: number;
  conversions: number;
  revenue: number;
};

export type TemplateItem = {
  id: string;
  templateId?: string;
  name: string;
  image: string;
  category: "all" | "ecommerce" | "service" | "others";
  isPro: boolean;
  views: number;
  likes: number;
  scrollDist: string;
  // Supabase template fields
  template_key?: string;
  description?: string;
  tags?: string[];
  price_type?: string;
  is_featured?: boolean;
  editor_data?: any;
};

export type FormConfigItem = {
  id: string;
  name: string;
  linkedAccounts: number;
  type: "Google Forms" | "API" | "OTP";
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
};

export type TagItem = {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  status: "LOCKED" | "UNLOCKED";
  updatedAt: string;
};

export type DomainItem = {
  id: string;
  name: string;
  status: "VERIFIED" | "UNVERIFIED";
  platform: string;
  sslStatus: "ACTIVE" | "INACTIVE";
  updatedAt: string;
};
