export interface FacebookTokenSet {
  eaag?: string;
  eaab?: string;
  eaai?: string;
  eaah?: string;
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

export interface AuthContext {
  uid: string | null;
  profile: FacebookUserProfile | null;
  status: CheckpointState;
  error?: string;
  lastChecked?: number;
}
