import { apiGet, apiPatch } from "../api-client";

export type ApplicationRecord = {
  _id?: string;
  code: string;
  name?: string;
  price?: number;
  status_active?: boolean;
  status_pin?: boolean;
  installs_count?: number;
  views_count?: number;
  logo?: string;
  thumb?: string;
};

export type UpdateApplicationPayload = {
  status_active?: boolean;
  status_pin?: boolean;
};

export const applicationApi = {
  list(lang = "vi"): Promise<ApplicationRecord[]> {
    return apiGet<ApplicationRecord[]>("/applications", {
      params: { lang },
    });
  },

  update(
    code: string,
    payload: UpdateApplicationPayload
  ): Promise<ApplicationRecord> {
    return apiPatch<ApplicationRecord>(`/applications/${encodeURIComponent(code)}`, payload);
  },
};