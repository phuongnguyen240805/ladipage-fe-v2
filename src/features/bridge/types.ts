export interface BridgeRequest {
  channel: string;
  payload?: any;
  timeout?: number;
}

export interface BridgeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BridgeOptions {
  timeout?: number;
  requireDesktop?: boolean;
}
