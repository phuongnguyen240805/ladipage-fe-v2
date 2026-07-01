export interface WorkspaceSettingsDto {
  name: string;
  logo?: string;
  timezone: string;
  locale?: string;
  description?: string;
}

export type UpdateWorkspaceSettingsPayload = Partial<WorkspaceSettingsDto>;

export interface FacebookIntegrationDto {
  token?: string;
  pageId?: string;
  configured?: boolean;
}

export interface ZaloIntegrationDto {
  token?: string;
  oaId?: string;
  configured?: boolean;
}

export interface IntegrationsSettingsDto {
  facebook?: FacebookIntegrationDto;
  zalo?: ZaloIntegrationDto;
}

export interface FacebookIntegrationSettingsInput {
  token?: string;
  pageId?: string;
}

export interface ZaloIntegrationSettingsInput {
  token?: string;
  oaId?: string;
}

export interface UpdateIntegrationsSettingsPayload {
  facebook?: FacebookIntegrationSettingsInput;
  zalo?: ZaloIntegrationSettingsInput;
}
