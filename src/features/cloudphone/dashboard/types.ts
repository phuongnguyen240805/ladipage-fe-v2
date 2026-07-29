export type CloudPhoneView = "store" | "devices" | "sync";
export type DeviceOS = "ios" | "android";
export type DeviceStatus = "online" | "busy" | "offline";

export interface CloudPhoneDashboardProps {
  view: CloudPhoneView;
}

export interface DeviceData {
  id: string;
  no: string;
  name: string;
  serial: string;
  plan: string;
  status: DeviceStatus;
  proxyIp: string;
  proxyName: string;
  note: string;
  os: string;
  battery: number;
  appRunning: string;
  screenState: string;
  actionLogs: string[];
  gads?: {
    udid: string;
    streamType: string;
    screenWidth: number;
    screenHeight: number;
  };
}
