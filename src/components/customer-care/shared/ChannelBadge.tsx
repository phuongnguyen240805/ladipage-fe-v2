import type { CustomerCareChannel } from "@liora/api-types";
import { Facebook, Globe2, Instagram, MessageCircle, Music2, Send } from "lucide-react";

const channelMeta: Record<
  CustomerCareChannel,
  { label: string; className: string; icon: React.ReactNode }
> = {
  facebook: {
    label: "Facebook",
    className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    icon: <Facebook className="h-3.5 w-3.5" />,
  },
  instagram: {
    label: "Instagram",
    className: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
    icon: <Instagram className="h-3.5 w-3.5" />,
  },
  zalo: {
    label: "Zalo",
    className: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
  },
  whatsapp: {
    label: "WhatsApp",
    className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: <Send className="h-3.5 w-3.5" />,
  },
  tiktok: {
    label: "TikTok",
    className: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    icon: <Music2 className="h-3.5 w-3.5" />,
  },
  website: {
    label: "Website",
    className: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    icon: <Globe2 className="h-3.5 w-3.5" />,
  },
};

export function ChannelBadge({
  channel,
  compact = false,
}: {
  channel: CustomerCareChannel;
  compact?: boolean;
}) {
  const meta = channelMeta[channel];
  return (
    <span
      title={meta.label}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold ${meta.className}`}
    >
      {meta.icon}
      {!compact && <span>{meta.label}</span>}
    </span>
  );
}
