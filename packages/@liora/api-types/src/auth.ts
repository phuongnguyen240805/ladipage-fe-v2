export interface LoginToken {
  token: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  captchaId: string;
  verifyCode: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  nonce?: string;
}

export type GoogleRegisterPayload = GoogleLoginPayload;

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ImageCaptcha {
  img: string;
  id: string;
}

/** @deprecated Platform authentication is Nest-only. */
export type AuthMode = "legacy" | "supabase";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  lang: string;
}

export interface RegisterResponse {
  message?: string;
}