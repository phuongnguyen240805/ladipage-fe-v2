"use client";

import React, { useState } from "react";

// --- Inline SVG Icons equivalent to Tabler Icons ---

function IconBrandTiktok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M21 11.5a8.38 8.38 0 0 1 -.9 3.8a8.5 8.5 0 1 1 -7.6 -6.5a4.3 4.3 0 0 0 2.9 -2.6a10 10 0 0 1 .7 .7a1 1 0 0 0 1.2 0a6.5 6.5 0 0 0 3.7 -1.3v5.7z" />
      <path d="M12 13.5a2.5 2.5 0 1 0 2.5 2.5" />
    </svg>
  );
}

function IconBrandFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
    </svg>
  );
}

function IconBrandInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <path d="M12 12m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
      <path d="M16.5 7.5l0 .01" />
    </svg>
  );
}

function IconBug(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 9v-1a3 3 0 0 1 6 0v1" />
      <path d="M18 9c0 4 -2 7 -6 7s-6 -3 -6 -7s2 -5 6 -5s6 1 6 5z" />
      <path d="M3 13l4 -1.5" />
      <path d="M3 6l4 3.5" />
      <path d="M3 20l4 -3" />
      <path d="M21 13l-4 -1.5" />
      <path d="M21 6l-4 3.5" />
      <path d="M21 20l-4 -3" />
      <path d="M12 16v4" />
    </svg>
  );
}

function IconAdjustmentsHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="14" cy="6" r="2" />
      <path d="M4 6l8 0" />
      <path d="M16 6l4 0" />
      <circle cx="8" cy="12" r="2" />
      <path d="M4 12l2 0" />
      <path d="M10 12l10 0" />
      <circle cx="17" cy="18" r="2" />
      <path d="M4 18l11 0" />
      <path d="M19 18l1 0" />
    </svg>
  );
}

function IconArrowsShuffle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M18 4l3 3l-3 3" />
      <path d="M18 20l3 -3l-3 -3" />
      <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" />
      <path d="M21 7h-5a4.978 4.978 0 0 0 -3 1" />
      <path d="M3 17h3a5 5 0 0 0 3.2 -1.1" />
    </svg>
  );
}

function IconCoins(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <ellipse cx="9" cy="12" rx="6" ry="3" />
      <ellipse cx="9" cy="6" rx="6" ry="3" />
      <path d="M3 6v6c0 1.66 2.69 3 6 3s6 -1.34 6 -3v-6" />
      <path d="M3 12v6c0 1.66 2.69 3 6 3s6 -1.34 6 -3v-6" />
    </svg>
  );
}

function IconDeviceMobile(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M11 4l2 0" />
      <path d="M12 17l0 .01" />
    </svg>
  );
}

function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
      <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
      <path d="M16 5l3 3" />
    </svg>
  );
}

function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="12" cy="12" r="2" />
      <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
    </svg>
  );
}

function IconFileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
      <line x1="9" y1="9" x2="10" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function IconMessageCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}

function IconPencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
    </svg>
  );
}

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPower(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 6a7.75 7.75 0 1 0 10 0" />
      <line x1="12" y1="4" x2="12" y2="12" />
    </svg>
  );
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="10" cy="10" r="7" />
      <line x1="21" y1="21" x2="15" y2="15" />
    </svg>
  );
}

function IconShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="6" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
      <path d="M17 17h-11v-14h-2" />
      <path d="M6 5l14 1l-1 7h-13" />
    </svg>
  );
}

function IconUserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 11h6" />
      <path d="M19 8v6" />
    </svg>
  );
}

function IconVideo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <rect x="3" y="5" width="12" height="14" rx="2" />
      <path d="M21 9l-4 3l4 3v-6z" />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// --- Data Constants matching Flowise ---

const platforms = [
  { value: "tiktok" as const, label: "Tiktok", icon: IconBrandTiktok, color: "#00a6ff" },
  { value: "facebook" as const, label: "Facebook", icon: IconBrandFacebook, color: "#1877f2" },
  { value: "instagram" as const, label: "Instagram", icon: IconBrandInstagram, color: "#e1306c" },
];

const actionGroups = [
  {
    title: "Interact",
    actions: ["Read Notifications", "Video Random", "Video Specific", "Video Keyword", "Video User", "Live Random", "Live Specific"],
  },
  {
    title: "Follow & Message",
    actions: ["Follow User", "Follow User Keyword", "Follow Back", "Follow User By Profile", "Follow User Suggest", "Message Designated", "Reply Specific Comment"],
  },
  {
    title: "Account Functions",
    actions: ["Earn Money", "Create Post", "Update Avatar", "Change Name", "Change Bio", "Public Like", "Sleep"],
  },
];

const defaultScripts = [
  { name: "Default", totalAction: 1, action: "Video Random" },
  { name: "Warm account", totalAction: 6, action: "Read Notifications" },
];

// --- Main Component ---

export default function SocialAccounts() {
  const [platform, setPlatform] = useState<"tiktok" | "facebook" | "instagram">("tiktok");
  const [dialog, setDialog] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("Follow User");

  const PlatformIcon = platforms.find((item) => item.value === platform)?.icon || IconBrandTiktok;
  const activePlatform = platforms.find((item) => item.value === platform) || platforms[0];

  const configActions = [
    { label: "General", icon: IconAdjustmentsHorizontal, color: "#2563eb", dialog: "settings" },
    { label: "Interaction", icon: IconArrowsShuffle, color: "#0891b2", dialog: "script" },
    { label: "Earn Money", icon: IconCoins, color: "#16a34a", dialog: "earn" },
    { label: "Register", icon: IconUserPlus, color: "#7c3aed", dialog: "register" },
  ];

  const statusItems = [
    { icon: PlatformIcon, value: "0", label: activePlatform.label, color: activePlatform.color },
    { icon: IconCoins, value: "0", label: "Coin Earn", color: "#16a34a" },
    { icon: IconPower, value: "0 / 0", label: "On / Off", color: "#f59e0b" },
    { icon: IconDeviceMobile, value: "0", label: "Live", color: "#0ea5e9" },
    { icon: IconBug, value: "0", label: "Failed", color: "#ef4444" },
  ];

  const openActionForm = (action: string) => {
    setSelectedAction(action);
    setDialog(action === "Earn Money" ? "earn" : "follow-user");
  };

  return (
    <div className="space-y-4">
      {/* Outer wrapper panel */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#11121b]">
        {/* Tabs Row */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-2 min-h-[46px] bg-slate-50/20">
          {platforms.map((item) => {
            const Icon = item.icon;
            const isActive = platform === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setPlatform(item.value)}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition cursor-pointer select-none ${
                  isActive
                    ? "border-amber-500 text-amber-500"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                <Icon className="h-4 w-4" style={{ color: item.color }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {configActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => setDialog(action.dialog)}
                      style={{
                        color: action.color,
                        borderColor: `${action.color}65`,
                        backgroundColor: `${action.color}14`,
                      }}
                      className="flex items-center justify-start gap-2 rounded-lg border px-3 py-2 text-xs font-black transition cursor-pointer hover:brightness-95 active:scale-98 select-none min-h-[38px] text-left"
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Status */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">Status</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {statusItems.map(({ icon: Icon, value, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#11121b]"
                  >
                    <Icon className="h-6.5 w-6.5 shrink-0" style={{ color }} />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-950 dark:text-white leading-tight">{value}</div>
                      <div className="text-[10px] font-bold text-slate-400 truncate leading-none mt-0.5">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Package Required warning box */}
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center dark:border-slate-850 dark:bg-slate-950/10">
            <IconShoppingCart className="h-11 w-11 text-amber-500 mb-3" />
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-1">Service package required</h3>
            <p className="max-w-md text-xs font-medium leading-relaxed text-slate-400">
              Buy or activate a social automation package to import accounts, assign devices, and run scripts.
            </p>
          </div>
        </div>
      </div>

      {/* Dialog render tree */}
      <SettingsDialog open={dialog === "settings"} onClose={() => setDialog(null)} />
      <ScriptDialog open={dialog === "script"} onClose={() => setDialog(null)} onAdd={() => setDialog("action-list")} />
      <ActionListDialog open={dialog === "action-list"} onClose={() => setDialog("script")} onPick={openActionForm} />
      <FollowUserDialog open={dialog === "follow-user"} title={`Add ${selectedAction}`} onClose={() => setDialog("action-list")} />
      <EarnMoneyDialog open={dialog === "earn"} onClose={() => setDialog(null)} />
      <RegisterDialog open={dialog === "register"} onClose={() => setDialog(null)} />
    </div>
  );
}

// --- Sub-Dialog Helper Components ---

function CleanDialogTitle({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 dark:border-slate-850">
      <h3 className="text-sm font-black text-slate-900 dark:text-white">{children}</h3>
      <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-650 dark:hover:bg-slate-800 transition cursor-pointer">
        <IconX className="h-5 w-5" />
      </button>
    </div>
  );
}

// Custom switch element mimicking Material UI
function SwitchLine({ label, checked }: { label: string; checked?: boolean }) {
  const [isOn, setIsOn] = useState(checked || false);
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsOn(!isOn)}
        type="button"
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isOn ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isOn ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">{label}</span>
    </div>
  );
}

function CheckLine({ label, extra, disabled }: { label: string; extra?: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" disabled={disabled} className="h-4 w-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:opacity-50" />
      <span className={`text-xs font-semibold select-none ${disabled ? "text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{label}</span>
      {extra}
    </div>
  );
}

function RangeInput({ label, left, right, suffix }: { label: string; left: string; right: string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-black text-slate-700 dark:text-slate-300">{label}</div>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          defaultValue={left}
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
        />
        <span className="text-slate-400 font-bold">-</span>
        <input
          type="text"
          defaultValue={right}
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
        />
        {suffix && <span className="text-[10px] font-black text-slate-400 uppercase select-none shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 mb-3 dark:border-slate-800 bg-white dark:bg-[#11121b]">
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// 1. Settings Dialog
function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>General Settings</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 space-y-4.5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <SwitchLine label="Logout after interaction" />
            <SwitchLine label="Turn off account after interaction" checked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Runtime limit (minutes)
              <input type="text" defaultValue="300" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Action limit (minutes)
              <input type="text" defaultValue="60" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Delay open job from
              <input type="text" defaultValue="3" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Delay open job to
              <input type="text" defaultValue="5" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Captcha delay
              <input type="text" defaultValue="5" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Captcha Mode
              <select defaultValue="Random" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none">
                <option value="Random">Random action</option>
                <option value="Like">Like first</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Link Open Job
              <select defaultValue="Random" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none">
                <option value="Random">Open link: Random</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
              Login Mode
              <select defaultValue="UID|PASS" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none">
                <option value="UID|PASS">UID|PASS</option>
                <option value="COOKIE">Cookie</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/10">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 cursor-pointer shadow-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Scripts Dialog
interface ScriptTableProps {
  rows: Array<{ name: string; totalAction: string | number; action?: string }>;
  compact?: boolean;
}

function ScriptTable({ rows, compact }: ScriptTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-850 dark:bg-[#11121b]">
      {/* Table Header */}
      <div className="grid grid-cols-12 bg-slate-50/70 p-3 text-[10px] font-black uppercase text-slate-400 dark:bg-slate-900/40">
        <div className="col-span-2 text-center">#</div>
        <div className={compact ? "col-span-6" : "col-span-4"}>Name</div>
        <div className={compact ? "col-span-2" : "col-span-3"}>{compact ? "Meta" : "Actions"}</div>
        <div className="col-span-3 text-center">Options</div>
      </div>
      {/* Table Body */}
      {rows.map((row, index) => (
        <div
          key={row.name}
          className={`grid grid-cols-12 p-3 items-center border-t border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 ${
            index === 0 ? "bg-amber-500/8 dark:bg-amber-500/5 text-amber-600 dark:text-amber-500" : ""
          }`}
        >
          <div className="col-span-2 text-center text-slate-400 font-semibold">{index + (compact ? 0 : 1)}</div>
          <div className={`${compact ? "col-span-6 font-extrabold" : "col-span-4 font-extrabold"}`}>{row.name}</div>
          <div className={compact ? "col-span-2 text-slate-500 font-mono text-[10px]" : "col-span-3 font-semibold"}>{row.totalAction}</div>
          <div className="col-span-3 flex justify-center gap-2">
            <button className="text-blue-600 hover:text-blue-700 p-0.5 cursor-pointer">
              <IconEye className="h-4 w-4" />
            </button>
            <button className="text-cyan-600 hover:text-cyan-700 p-0.5 cursor-pointer">
              <IconEdit className="h-4 w-4" />
            </button>
            <button className="text-rose-600 hover:text-rose-700 p-0.5 cursor-pointer">
              <IconX className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScriptDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>Scripts</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left panel: Scripts Table */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={onAdd}
                className="flex items-center gap-1 bg-blue-600 text-white font-black text-xs px-3.5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer select-none shadow-sm shadow-blue-500/10"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
              <div className="relative max-w-[180px] w-full">
                <input
                  type="text"
                  placeholder="Search scripts"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
                />
                <IconSearch className="absolute right-2.5 top-2.25 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <ScriptTable rows={defaultScripts} />
          </div>

          {/* Right panel: Active Script Editor */}
          <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-6 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Default script</h4>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onAdd}
                  className="flex items-center gap-1 border border-slate-250 text-slate-700 font-black text-xs px-3.5 py-2 rounded-lg hover:bg-slate-50 transition cursor-pointer select-none dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  <span>Action</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center bg-blue-600 text-white font-black text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer select-none shadow-sm shadow-blue-500/10"
                >
                  Save
                </button>
              </div>
            </div>
            <ScriptTable rows={[{ name: "Video Random", totalAction: "Type: default" }]} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Action List Dialog
function ActionListDialog({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (action: string) => void }) {
  if (!open) return null;
  const groupTone: Record<string, string> = {
    Interact: "#2563eb",
    "Follow & Message": "#16a34a",
    "Account Functions": "#7c3aed",
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>Script Actions</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          {actionGroups.map((group) => {
            const color = groupTone[group.title];
            return (
              <div key={group.title} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col dark:border-slate-800 dark:bg-[#11121b]">
                {/* Section Header */}
                <div
                  style={{
                    backgroundColor: `${color}14`,
                    color: color,
                  }}
                  className="flex items-center gap-2 p-3 font-extrabold text-xs select-none border-b border-slate-200 dark:border-slate-800"
                >
                  {group.title === "Interact" ? (
                    <IconVideo className="h-4.5 w-4.5" />
                  ) : group.title === "Follow & Message" ? (
                    <IconMessageCircle className="h-4.5 w-4.5" />
                  ) : (
                    <IconFileText className="h-4.5 w-4.5" />
                  )}
                  <span>{group.title}</span>
                </div>
                {/* Actions Items */}
                <div className="flex-1 overflow-y-auto max-h-[40vh] divide-y divide-slate-100 dark:divide-slate-850">
                  {group.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => onPick(action)}
                      style={{
                        "--hover-bg": `${color}10`,
                      } as React.CSSProperties}
                      className="w-full text-left p-2.5 text-[11px] font-bold text-slate-700 hover:bg-[var(--hover-bg)] dark:text-slate-350 dark:hover:bg-slate-800/40 transition cursor-pointer select-none"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 4. Follow User Dialog
function FollowUserDialog({ open, title, onClose }: { open: boolean; title: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>{title}</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 space-y-4 max-h-[70vh] overflow-y-auto">
          <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
            Action name
            <input
              type="text"
              defaultValue={title.replace("Add ", "")}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
            User list
            <textarea
              placeholder="user_01&#10;user_02&#10;..."
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none min-h-[100px] leading-relaxed"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RangeInput label="User count" left="1" right="2" suffix="users" />
            <RangeInput label="Delay time" left="3" right="5" suffix="secs" />
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
            <CheckLine
              label="Exit when follow fails"
              extra={
                <input
                  type="text"
                  disabled
                  defaultValue="5"
                  className="ml-auto w-16 rounded border border-slate-200 bg-slate-50/50 px-2 py-0.5 text-center text-xs font-bold text-slate-400 outline-none disabled:opacity-60"
                />
              }
            />
            <CheckLine label="Open link by search" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/10">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 cursor-pointer shadow-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Earn Money Setup Dialog
function EarnMoneyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"job" | "farm">("job");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>Earn Money</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Mode Selector Row */}
          <div className="flex items-center gap-5 border-b border-slate-100 pb-3 dark:border-slate-850">
            <button
              onClick={() => setMode("job")}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <input type="radio" checked={mode === "job"} onChange={() => setMode("job")} className="h-4.5 w-4.5 text-amber-500 focus:ring-amber-500 cursor-pointer" />
              <span>Run jobs</span>
            </button>
            <button
              onClick={() => setMode("farm")}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <input type="radio" checked={mode === "farm"} onChange={() => setMode("farm")} className="h-4.5 w-4.5 text-amber-500 focus:ring-amber-500 cursor-pointer" />
              <span>Warm account</span>
            </button>
          </div>

          {mode === "job" ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Form */}
              <div className="md:col-span-7 rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-[#11121b] space-y-3.5">
                <div className="flex items-center gap-4">
                  <CheckLine label="TDTT" />
                  <CheckLine label="GoLike" />
                </div>
                <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                  Token
                  <input type="text" placeholder="Token" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
                </label>
                <div className="text-[10px] font-bold text-slate-400 -mt-1 select-none">web.traodoituongtac.com</div>
                <RangeInput label="Interval between jobs" left="10" right="20" suffix="secs" />
                <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                  Job waiting time
                  <input type="text" defaultValue="20 secs" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                  Successful job limit
                  <input type="text" defaultValue="200 jobs" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                  Stop after failures
                  <input type="text" defaultValue="20 jobs" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
                </label>
              </div>

              {/* Right Form */}
              <div className="md:col-span-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-[#11121b] space-y-3.5">
                <CheckLine label="Surf News Feed after each batch" />
                <RangeInput label="Jobs per batch" left="5" right="10" />
                <div className="text-[11px] font-black text-slate-800 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">Job types</div>
                <div className="space-y-2">
                  <CheckLine label="Like" />
                  <CheckLine label="Follow" />
                  <CheckLine label="Comment" />
                  <CheckLine label="View" disabled extra={<span className="text-[9px] font-extrabold text-slate-400 uppercase ml-auto">disabled</span>} />
                  <CheckLine label="Share" disabled extra={<span className="text-[9px] font-extrabold text-slate-400 uppercase ml-auto">disabled</span>} />
                  <CheckLine label="Livestream" disabled extra={<span className="text-[9px] font-extrabold text-slate-400 uppercase ml-auto">disabled</span>} />
                </div>
                <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                  <CheckLine label="Open link by search" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4 max-w-lg dark:border-slate-800 bg-white dark:bg-[#11121b] space-y-4">
              <RangeInput label="Video watch time" left="1" right="1" suffix="secs/account" />
              <CheckLine label="Like video" />
              <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                Like video ratio
                <input type="text" disabled defaultValue="50%" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500 outline-none disabled:opacity-60" />
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/10">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
          <button disabled className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white opacity-50 cursor-not-allowed">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. Register Dialog
function RegisterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-850 dark:bg-[#0c0d14]">
        <CleanDialogTitle onClose={onClose}>Register</CleanDialogTitle>
        <div className="p-6 border-b border-slate-150 dark:border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {/* Left Column */}
          <div>
            <Fieldset title="General">
              <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                Register accounts
                <input type="text" defaultValue="10" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
              </label>
              <RangeInput label="Registration delay" left="Time ..." right="Time ..." suffix="secs" />
              <RangeInput label="Birthdate delay" left="5" right="10" suffix="secs" />
            </Fieldset>
            <Fieldset title="Account Info">
              <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                Email domain
                <input type="text" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <CheckLine label="Random password" />
                <input type="text" defaultValue="Min@123456" className="w-32 rounded-lg border border-slate-200 bg-slate-50/50 p-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <CheckLine label="Set name" />
                <select disabled defaultValue="vn" className="rounded-lg border border-slate-200 bg-slate-50/50 p-1.5 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500 outline-none disabled:opacity-50">
                  <option value="vn">Vietnamese name</option>
                </select>
              </div>
              <label className="flex flex-col gap-1 text-[10px] font-black text-slate-400 uppercase">
                Gallery
                <input type="text" defaultValue="None" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none" />
              </label>
              <div className="flex items-center gap-3">
                <CheckLine label="Set bio" />
                <button className="flex items-center gap-1.5 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer">
                  <IconPencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </Fieldset>
          </div>

          {/* Right Column */}
          <div>
            <Fieldset title="Registration Mode">
              <select defaultValue="Mail domain" className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none w-full">
                <option value="Mail domain">Mail domain</option>
                <option value="Manual">Manual</option>
              </select>
            </Fieldset>
            <Fieldset title="After Register">
              {["Verify mail", "Enable professional mode", "Delete app data after registration", "Upload video after registration", "Earn money"].map((item) => (
                <CheckLine key={item} label={item} />
              ))}
              <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/20 dark:border-slate-800 space-y-2 mt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" defaultChecked name="after-reg-media" className="h-4 w-4 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                    <span>Photo / Video</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" name="after-reg-media" className="h-4 w-4 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                    <span>Use avatar photo</span>
                  </label>
                </div>
              </div>
            </Fieldset>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/10">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 cursor-pointer shadow-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
