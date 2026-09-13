import type {
  GoogleLoginPayload,
  GoogleRegisterPayload,
  ImageCaptcha,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "@liora/api-types";
import type { BackendSessionSnapshot } from "@/lib/backend/session-types";
import { publicApiClient } from "../api-client";

export const authApi = {
  getCaptchaImage(width = 120, height = 44): Promise<ImageCaptcha> {
    return publicApiClient
      .get<ImageCaptcha>("/auth/captcha/img", { params: { width, height } })
      .then((r) => r.data);
  },
  login(payload: LoginPayload): Promise<BackendSessionSnapshot> {
    return publicApiClient.post<BackendSessionSnapshot>("/auth/login", payload).then((r) => r.data);
  },
  googleLogin(payload: GoogleLoginPayload): Promise<BackendSessionSnapshot> {
    return publicApiClient.post<BackendSessionSnapshot>("/auth/google", payload).then((r) => r.data);
  },
  googleRegister(payload: GoogleRegisterPayload): Promise<RegisterResponse | void> {
    return publicApiClient
      .post<RegisterResponse | void>("/auth/google/register", payload)
      .then((r) => r.data);
  },
  register(payload: RegisterPayload): Promise<RegisterResponse | void> {
    return publicApiClient
      .post<RegisterResponse | void>("/auth/register", payload)
      .then((r) => r.data);
  },
};
