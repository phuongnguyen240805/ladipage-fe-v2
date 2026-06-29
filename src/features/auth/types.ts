import type {
  AccountInfo,
  AccountMenus,
  AuthMode,
  TenantJwtContext,
} from "@liora/api-types";

export interface FacebookTokenSet {
  eaag?: string;
  eaab?: string;
  eaai?: string;
  eaah?: string;
}

export interface TokenExpiryMap {
  eaag?: number;
  eaab?: number;
  eaai?: number;
  eaah?: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  expiresAt?: number;
  scopes?: string[];
  userId?: string;
  source?: "bridge" | "graph_api" | "format" | "cache";
  error?: { code: number; message: string };
}

export interface FacebookUserProfile {
  uid: string;
  name: string;
  avatarUrl?: string;
  cookie?: string;
  tokenSet?: FacebookTokenSet;
}

export type CheckpointState =
  | "ok"
  | "not_login"
  | "checkpoint_282"
  | "checkpoint_956"
  | "extension_unavailable";

export type PlatformStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface PlatformSession {
  authMode: AuthMode;
  nestToken: string | null;
  nestTokenExp: number | null;
  supabaseAccessToken: string | null;
  supabaseRefreshToken: string | null;
  profile: AccountInfo | null;
  permissions: string[];
  menus: AccountMenus[];
  tenant: TenantJwtContext;
}

export interface FacebookSession {
  uid: string | null;
  profile: FacebookUserProfile | null;
  status: CheckpointState;
  error?: string;
  lastChecked?: number;
  tokenExpiresAt?: TokenExpiryMap;
}

export interface AuthState {
  platform: PlatformSession;
  platformStatus: PlatformStatus;
  authBootstrapped: boolean;
  facebook: FacebookSession;

  setPlatformSession: (session: Partial<PlatformSession>) => void;
  setPlatformStatus: (status: PlatformStatus) => void;
  setAuthBootstrapped: (bootstrapped: boolean) => void;
  setFacebookContext: (ctx: Partial<FacebookSession>) => void;
  setProfile: (profile: FacebookUserProfile) => void;
  updateTokens: (tokens: Partial<FacebookTokenSet>) => void;
  setAuthContext: (ctx: Partial<FacebookSession>) => void;
  setStatus: (status: CheckpointState) => void;
  clearAuth: () => void;
  clearPlatformAuth: () => void;
  clearFacebookAuth: () => void;
  clearAllAuth: () => void;
}

export const initialPlatformSession: PlatformSession = {
  authMode: "legacy",
  nestToken: null,
  nestTokenExp: null,
  supabaseAccessToken: null,
  supabaseRefreshToken: null,
  profile: null,
  permissions: [],
  menus: [],
  tenant: {},
};

export const initialFacebookSession: FacebookSession = {
  uid: null,
  profile: null,
  status: "not_login",
  error: undefined,
  lastChecked: undefined,
  tokenExpiresAt: undefined,
};