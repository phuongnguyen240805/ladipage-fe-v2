import type {
  IntegrationsSettingsDto,
  UpdateIntegrationsSettingsPayload,
  UpdateWorkspaceSettingsPayload,
  WorkspaceSettingsDto,
} from "@liora/api-types";
import { apiGet, apiPut } from "../api-client";

export const settingsApi = {
  getWorkspace(): Promise<WorkspaceSettingsDto> {
    return apiGet<WorkspaceSettingsDto>("/settings/workspace");
  },

  updateWorkspace(
    payload: UpdateWorkspaceSettingsPayload
  ): Promise<WorkspaceSettingsDto> {
    return apiPut<WorkspaceSettingsDto>("/settings/workspace", payload);
  },

  getIntegrations(): Promise<IntegrationsSettingsDto> {
    return apiGet<IntegrationsSettingsDto>("/settings/integrations");
  },

  updateIntegrations(
    payload: UpdateIntegrationsSettingsPayload
  ): Promise<IntegrationsSettingsDto> {
    return apiPut<IntegrationsSettingsDto>("/settings/integrations", payload);
  },
};
