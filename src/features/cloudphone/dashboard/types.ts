export type CloudPhoneView = "store" | "devices" | "sync";
export type DeviceOS = "ios" | "android";
export type DeviceStatus = "online" | "busy" | "offline";

export interface CloudPhoneDashboardProps {
  view: CloudPhoneView;
}

export interface DeviceData {
  id: number;
  no: string;
  name: string;
  serial: string;
  plan: string;
  online: boolean;
  proxyIp: string;
  proxyName: string;
  note: string;
  os: string;
  battery: number;
  appRunning: string;
  screenState: string;
  actionLogs: string[];
}
