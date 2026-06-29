export type FlowStatus = "ACTIVE" | "INACTIVE";

export interface FlowItem {
  id: string;
  name: string;
  status: FlowStatus;
  createdAt: string;
  triggerType?: string;
}

export type IntegrationStatus = "ACTIVE" | "INACTIVE";

export interface IntegrationItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: IntegrationStatus;
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  recommends?: boolean;
  descriptionFull?: string;
  triggerEvent?: string;
  conditionUse?: string;
  previewType?: "email" | "zalo" | "sms" | "facebook";
  previewTitle?: string;
  previewBody?: string;
}
