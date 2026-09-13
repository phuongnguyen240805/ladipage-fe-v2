import type {
  AccountInfo,
  AccountMenus,
  AccountUpdatePayload,
  PasswordUpdatePayload,
} from "@liora/api-types";
import { apiGet, apiPost, apiPut } from "../api-client";

export const accountApi = {
  getProfile(): Promise<AccountInfo> {
    return apiGet<AccountInfo>("/account/profile");
  },

  getMenus(): Promise<AccountMenus[]> {
    return apiGet<AccountMenus[]>("/account/menus");
  },

  getPermissions(): Promise<string[]> {
    return apiGet<string[]>("/account/permissions");
  },

  updateProfile(payload: AccountUpdatePayload): Promise<void> {
    return apiPut<void>("/account/update", payload);
  },

  updatePassword(payload: PasswordUpdatePayload): Promise<void> {
    return apiPost<void>("/account/password", payload);
  },

};