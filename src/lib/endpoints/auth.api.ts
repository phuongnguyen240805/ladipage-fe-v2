import type {
  ImageCaptcha,
  LoginPayload,
  LoginToken,
  RegisterPayload,
  RegisterResponse,
  SupabaseExchangePayload,
} from "@liora/api-types";
import { publicApiClient } from "../api-client";

export const authApi = {
  getCaptchaImage(width = 120, height = 44): Promise<ImageCaptcha> {
    return publicApiClient
      .get<ImageCaptcha>("/auth/captcha/img", { params: { width, height } })
      .then((r) => r.data);
  },

  login(payload: LoginPayload): Promise<LoginToken> {
    return publicApiClient
      .post<LoginToken>("/auth/login", payload)
      .then((r) => r.data);
  },

  exchange(payload: SupabaseExchangePayload): Promise<LoginToken> {
    return publicApiClient
      .post<LoginToken>("/auth/exchange", payload)
      .then((r) => r.data);
  },

  register(payload: RegisterPayload): Promise<RegisterResponse | void> {
    return publicApiClient
      .post<RegisterResponse | void>("/auth/register", payload)
      .then((r) => r.data);
  },
};