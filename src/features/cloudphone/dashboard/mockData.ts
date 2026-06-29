import { DeviceOS, DeviceStatus, DeviceData } from "./types";

export const rentalPlans = [
  { id: "cp-eco", name: "CP Eco 01", region: "VN-HCM", cpu: "2 vCPU", ram: "3 GB", price: "18.000đ/giờ", stock: 42, badge: "Phổ biến" },
  { id: "cp-pro", name: "CP Pro Ads", region: "SG-SIN", cpu: "4 vCPU", ram: "6 GB", price: "39.000đ/giờ", stock: 18, badge: "Ổn định" },
  { id: "cp-max", name: "CP Max Farm", region: "US-LA", cpu: "8 vCPU", ram: "12 GB", price: "86.000đ/giờ", stock: 7, badge: "Hiệu năng" },
];

export const devices = Array.from({ length: 36 }).map((_, index) => {
  const os: DeviceOS = index % 2 === 0 ? "ios" : "android";
  const status: DeviceStatus = index % 11 === 0 ? "offline" : index % 5 === 0 ? "busy" : "online";
  const group = index < 12 ? "Group A" : index < 24 ? "Group B" : "Group C";
  const number = String(index + 1).padStart(2, "0");

  return {
    id: `CP-${os.toUpperCase()}-${number}`,
    name: os === "ios" ? `iPhone Farm ${number}` : `Android Farm ${number}`,
    os,
    status,
    group,
    region: index % 3 === 0 ? "VN-HCM" : index % 3 === 1 ? "SG-SIN" : "US-LA",
    battery: status === "offline" ? 0 : 64 + (index % 32),
    owner: status === "busy" ? "mmo_worker" : "available",
    session: status === "offline" ? "--" : `0${index % 4}:${String(10 + index).padStart(2, "0")}:3${index % 10}`,
    version: os === "ios" ? "iOS 17.2" : "Android 14",
    ip: `192.168.1.${100 + index}`,
  };
});

export const syncGroups = [
  { id: "grp-01", name: "Nhóm TikTok Shop", devices: 12, mode: "Mirror Tap", latency: "42ms", running: true },
  { id: "grp-02", name: "Nhóm Facebook Ads", devices: 8, mode: "Broadcast", latency: "65ms", running: true },
  { id: "grp-03", name: "Nhóm Warmup", devices: 24, mode: "Script Sync", latency: "88ms", running: false },
];

// Custom mock devices database representing rented products
export const mockDevicesData: DeviceData[] = [
  {
    id: 1,
    no: "1",
    name: "Samsung Galaxy Note 8 (Android 9)",
    serial: "98897a484c563456",
    plan: "Note 8 Gốc",
    online: true,
    proxyIp: "103.179.189.12:12323",
    proxyName: "Proxy VN (Active)",
    note: "Via cổ ngâm ads",
    os: "Android 9",
    battery: 89,
    appRunning: "Facebook Auto-Share",
    screenState: "fb",
    actionLogs: [
      "[21:55:12] Logging into Facebook account...",
      "[21:55:15] Proxy verified (103.179.189.12)",
      "[21:56:00] Sharing post ID 28847192 to group 'Chợ Cư Dân'...",
      "[21:57:40] Post shared successfully. Sleep 60s."
    ]
  },
  {
    id: 2,
    no: "2",
    name: "Samsung Galaxy Note 8 (Android 13)",
    serial: "98897a484c563457",
    plan: "Note 8 Change",
    online: true,
    proxyIp: "103.179.189.13:12323",
    proxyName: "Proxy VN2",
    note: "Clone spam group",
    os: "Android 13",
    battery: 98,
    appRunning: "TikTok Shop Bot",
    screenState: "tiktok",
    actionLogs: [
      "[21:56:01] Open TikTok app...",
      "[21:56:05] Watching video: 'Hướng dẫn xây kênh bán hàng'",
      "[21:56:45] Auto-liking video, delay next action...",
      "[21:57:30] Scrolling feed: current post ID 98218731"
    ]
  },
  {
    id: 3,
    no: "3",
    name: "Cloud Emulator",
    serial: "emulator-5554",
    plan: "Cloud Emulator 8 Core",
    online: true,
    proxyIp: "103.179.189.14:12323",
    proxyName: "Proxy SG",
    note: "Treo game Play Together",
    os: "Android Random",
    battery: 100,
    appRunning: "Play Together Bot",
    screenState: "game",
    actionLogs: [
      "[21:50:00] Launching game 'Play Together'...",
      "[21:50:30] Auto-fishing activated...",
      "[21:56:22] Caught: Cá chép vàng (+150 gold)",
      "[21:57:15] Inventory full, auto-selling items..."
    ]
  },
  {
    id: 4,
    no: "4",
    name: "Samsung Galaxy S7",
    serial: "FA76D0B0F3C2",
    plan: "Samsung S7 Day",
    online: false,
    proxyIp: "103.179.189.15:12323",
    proxyName: "Proxy SG2",
    note: "Gói hết hạn",
    os: "Android 13",
    battery: 0,
    appRunning: "None",
    screenState: "offline",
    actionLogs: [
      "[18:00:00] Device subscription expired.",
      "[18:00:01] Graceful shutdown initiated.",
      "[18:00:05] Connection terminated."
    ]
  },
  {
    id: 5,
    no: "5",
    name: "Xiaomi Redmi Note 11",
    serial: "XM9882A7D8",
    plan: "Xiaomi Pro",
    online: true,
    proxyIp: "103.179.189.16:12323",
    proxyName: "Proxy VN3",
    note: "Nuôi nick Shopee",
    os: "Android 12",
    battery: 74,
    appRunning: "Shopee Auto-Bump",
    screenState: "shopee",
    actionLogs: [
      "[21:53:10] Loading Shopee Shop page...",
      "[21:54:00] Auto-bumping product: 'Bình nước giữ nhiệt 1L'",
      "[21:55:00] Auto-bumping product: 'Tai nghe Bluetooth 5.3'",
      "[21:57:02] Bumping successful. Next batch in 4h."
    ]
  },
  {
    id: 6,
    no: "6",
    name: "Samsung Galaxy S7 Edge",
    serial: "FA76D0B0F3C5",
    plan: "Samsung S7 Day",
    online: true,
    proxyIp: "103.179.189.17:12323",
    proxyName: "Proxy SG3",
    note: "Spam tin nhắn Zalo",
    os: "Android 8.0",
    battery: 82,
    appRunning: "Zalo Broadcast",
    screenState: "zalo",
    actionLogs: [
      "[21:54:20] Zalo bot started.",
      "[21:55:00] Sending message to friend 'Nam Nguyen'...",
      "[21:56:10] Sending message to friend 'Lan Anh'...",
      "[21:57:11] Sent to 24 friends. Sleep 120s."
    ]
  },
  {
    id: 7,
    no: "7",
    name: "Google Pixel 6 Pro",
    serial: "PX6PRO9921",
    plan: "Google Pixel High",
    online: true,
    proxyIp: "103.179.189.18:12323",
    proxyName: "Proxy US",
    note: "Reg account Telegram",
    os: "Android 14",
    battery: 88,
    appRunning: "Telegram Member Adder",
    screenState: "telegram",
    actionLogs: [
      "[21:50:45] Connecting to Telegram API...",
      "[21:51:30] Querying target group: 'crypto_vn'...",
      "[21:55:20] Adding member '@jacky_dev' to group...",
      "[21:57:10] Member added successfully. Wait 300s to bypass limits."
    ]
  },
  {
    id: 8,
    no: "8",
    name: "LG V50 ThinQ",
    serial: "LGV508821",
    plan: "LG V50 Regular",
    online: true,
    proxyIp: "103.179.189.19:12323",
    proxyName: "Proxy JP",
    note: "Nuôi acc Twitter (X)",
    os: "Android 10",
    battery: 92,
    appRunning: "Twitter Automation",
    screenState: "home",
    actionLogs: [
      "[21:56:00] Open Twitter application...",
      "[21:56:15] Retweeting post ID 19828381...",
      "[21:57:05] Profile page updated. Action completed."
    ]
  }
];
