import React from "react";

interface PhoneScreenMockupProps {
  state: string;
}

export default function PhoneScreenMockup({ state }: PhoneScreenMockupProps) {
  if (state === "fb") {
    return (
      <div className="flex h-full flex-col bg-slate-900 text-white select-none">
        {/* FB Header */}
        <div className="bg-[#1877f2] px-2 py-1 flex items-center justify-between text-[8px] font-black shrink-0">
          <span>facebook</span>
          <div className="flex items-center gap-1">
            <span className="bg-white/20 p-0.5 rounded-full text-[6px]">🔍</span>
            <span className="bg-white/20 p-0.5 rounded-full text-[6px]">💬</span>
          </div>
        </div>
        {/* FB Feed Content */}
        <div className="flex-1 p-1.5 space-y-1 overflow-hidden bg-slate-950">
          <div className="flex items-center gap-1 shrink-0">
            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500" />
            <div className="min-w-0">
              <div className="text-[6px] font-black truncate text-slate-100">FB Ads Academy</div>
              <div className="text-[4px] text-slate-500 leading-none">Sponsored</div>
            </div>
          </div>
          <p className="text-[6px] text-slate-300 leading-tight line-clamp-2">
            🚀 Hệ thống tự động hóa Facebook Ads đỉnh cao, spam group, nuôi clone không bị checkpoint...
          </p>
          <div className="h-9 w-full rounded-lg bg-gradient-to-br from-indigo-900/50 to-indigo-950/50 flex items-center justify-center text-[7px] font-bold text-indigo-300 border border-indigo-800/20">
            Ad Image
          </div>
        </div>
        {/* Active Log Bar overlay */}
        <div className="bg-black/90 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">FB: Seeding group...</span>
        </div>
      </div>
    );
  }
  if (state === "tiktok") {
    return (
      <div className="flex h-full flex-col bg-black text-white relative select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/30 via-black to-cyan-950/30" />
        
        {/* Top Header */}
        <div className="absolute top-1.5 left-0 right-0 flex items-center justify-center gap-2 text-[7px] font-bold text-white/50 z-10">
          <span>Following</span>
          <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        </div>

        {/* Floating Side actions */}
        <div className="absolute right-1.5 top-1/4 flex flex-col items-center gap-1.5 z-10">
          <div className="h-4 w-4 rounded-full bg-white/20 border border-white/50 flex items-center justify-center text-[6px]">👤</div>
          <span className="text-rose-500 text-xs">❤️</span>
          <span className="text-white text-[9px]">💬</span>
          <span className="text-white text-[9px]">↪️</span>
        </div>

        {/* Bottom details */}
        <div className="absolute bottom-6 left-1.5 right-6 z-10 text-left space-y-0.5">
          <div className="text-[7px] font-black truncate">@tiktok_shop_vietnam</div>
          <p className="text-[6px] text-white/80 leading-normal line-clamp-1">
            Đập hộp chiếc Note 8 Farm giá siêu hời!
          </p>
          <div className="text-[5px] text-white/50 truncate">🎵 Sound - Note 8 Farm</div>
        </div>

        {/* Tiktok Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-5.5 bg-black/90 border-t border-white/10 flex items-center justify-between px-3 text-[6px] font-bold text-white/60 shrink-0 z-10">
          <span>Home</span>
          <span>Shop</span>
          <span className="bg-white text-black px-1.5 py-0.5 rounded-sm font-black">+</span>
          <span>Inbox</span>
          <span>Profile</span>
        </div>

        {/* Active Log Bar overlay */}
        <div className="absolute bottom-5.5 left-0 right-0 bg-black/95 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none z-10">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">TikTok: Watching video...</span>
        </div>
      </div>
    );
  }
  if (state === "game") {
    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-sky-400 via-emerald-400 to-amber-200 relative text-slate-800 select-none">
        <div className="absolute top-1 left-1 bg-black/35 text-white text-[6px] px-1 py-0.5 rounded font-mono scale-90">
          LV. 42
        </div>
        <div className="absolute top-1 right-1 bg-black/35 text-white text-[6px] px-1 py-0.5 rounded font-mono scale-90">
          Gold: 14.8K
        </div>
        
        {/* Virtual Joystick */}
        <div className="absolute bottom-6.5 left-2 h-7 w-7 rounded-full bg-black/20 border border-white/30 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-white/40" />
        </div>

        {/* Fishing Button */}
        <div className="absolute bottom-6.5 right-2 h-7.5 w-7.5 rounded-full bg-red-500 border border-white/35 flex items-center justify-center shadow active:scale-90 animate-bounce">
          <span className="text-[10px]">🎣</span>
        </div>

        {/* Center state */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
          <div className="text-base animate-pulse">🐠</div>
          <div className="text-[8px] font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Fishing...</div>
        </div>

        {/* Active Log Bar overlay */}
        <div className="bg-black/90 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none z-10">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">Game: Hooked fish!</span>
        </div>
      </div>
    );
  }
  if (state === "shopee") {
    return (
      <div className="flex h-full flex-col bg-slate-50 text-slate-850 select-none">
        {/* Shopee Header */}
        <div className="bg-[#f53d2d] px-2 py-1 flex items-center gap-2 shrink-0">
          <span className="text-white text-[10px] font-black">S</span>
          <div className="flex-1 bg-white rounded px-1.5 py-0.5 text-[5px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Tìm sản phẩm...</span>
            <span>🔍</span>
          </div>
        </div>
        {/* Grid products */}
        <div className="flex-1 p-1 grid grid-cols-2 gap-1 overflow-hidden bg-slate-100">
          <div className="bg-white border border-slate-200 rounded p-1 flex flex-col justify-between">
            <div className="h-6 w-full bg-gradient-to-tr from-orange-100 to-orange-200 rounded" />
            <div className="text-[5px] font-bold truncate mt-0.5">Bình nước giữ nhiệt 1L</div>
            <div className="text-[5px] text-[#f53d2d] font-bold">99.000đ</div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-1 flex flex-col justify-between">
            <div className="h-6 w-full bg-gradient-to-tr from-orange-100 to-orange-200 rounded" />
            <div className="text-[5px] font-bold truncate mt-0.5">Tai nghe Bluetooth 5.3</div>
            <div className="text-[5px] text-[#f53d2d] font-bold">150.000đ</div>
          </div>
        </div>
        {/* Active Log Bar overlay */}
        <div className="bg-black/90 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">Shopee: Bumping items...</span>
        </div>
      </div>
    );
  }
  if (state === "zalo") {
    return (
      <div className="flex h-full flex-col bg-[#eef0f2] text-slate-850 select-none">
        {/* Zalo Header */}
        <div className="bg-[#0068ff] text-white px-2 py-1 text-[7px] font-black shrink-0 flex items-center justify-between">
          <span>Zalo Marketing</span>
          <span className="text-[5px] opacity-75">Active</span>
        </div>
        {/* Chat window */}
        <div className="flex-1 p-1 space-y-1 overflow-hidden">
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-1 text-[5px] font-semibold max-w-[80%] border border-slate-200/50 leading-tight">
              Xin chào, bạn quan tâm đến dòng CloudPhone Note 8 chứ?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#e1f0ff] text-slate-800 rounded-lg p-1 text-[5px] font-semibold max-w-[80%] border border-[#0068ff]/10 leading-tight">
              Mình muốn tham khảo dòng Note 8 Change.
            </div>
          </div>
        </div>
        {/* Active Log Bar overlay */}
        <div className="bg-black/90 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">Zalo: Broadcast message...</span>
        </div>
      </div>
    );
  }
  if (state === "telegram") {
    return (
      <div className="flex h-full flex-col bg-[#182533] text-white select-none">
        {/* Telegram Header */}
        <div className="bg-[#17212b] px-2 py-1 flex items-center justify-between text-[7px] font-black shrink-0 border-b border-slate-950">
          <span>Telegram Scraper</span>
          <span>🔍</span>
        </div>
        {/* Chats list */}
        <div className="flex-1 p-1 divide-y divide-slate-950 overflow-hidden bg-[#182533]">
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="h-3 w-3 rounded-full bg-sky-500 flex items-center justify-center text-[4px] font-bold text-white">C</div>
            <div className="min-w-0">
              <div className="text-[5.5px] font-bold truncate">Crypto VN Community</div>
              <div className="text-[4px] text-slate-450 truncate leading-none">Hi everyone...</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 flex items-center justify-center text-[4px] font-bold text-white">M</div>
            <div className="min-w-0">
              <div className="text-[5.5px] font-bold truncate">Mmo Seeding Group</div>
              <div className="text-[4px] text-slate-400 truncate leading-none">Admin: Task update...</div>
            </div>
          </div>
        </div>
        {/* Active Log Bar overlay */}
        <div className="bg-black/90 border-t border-slate-900 px-1.5 py-1 text-[6.5px] text-lime-400 font-mono flex items-center gap-1 select-none">
          <span className="animate-pulse h-1 w-1 rounded-full bg-lime-400 shrink-0" />
          <span className="truncate">TG: Scraping members...</span>
        </div>
      </div>
    );
  }
  if (state === "home") {
    return (
      <div className="flex h-full flex-col bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 relative text-white select-none p-2 justify-between">
        {/* Grid of app shortcuts */}
        <div className="grid grid-cols-4 gap-2.5 mt-2">
          {["bg-blue-600", "bg-black", "bg-[#f53d2d]", "bg-emerald-500", "bg-sky-500", "bg-[#0068ff]", "bg-amber-500", "bg-slate-500"].map((color, idx) => (
            <div key={idx} className="flex flex-col items-center gap-0.5 scale-90">
              <div className={`h-3.5 w-3.5 rounded-sm ${color} shadow-sm flex items-center justify-center text-[4.5px] font-black`}>
                {idx === 0 && "FB"}
                {idx === 1 && "TT"}
                {idx === 2 && "SP"}
                {idx === 3 && "G"}
                {idx === 4 && "TG"}
                {idx === 5 && "ZL"}
                {idx === 6 && "⚙️"}
                {idx === 7 && "🗂️"}
              </div>
            </div>
          ))}
        </div>

        {/* Standby indicator */}
        <div className="mb-2 text-center">
          <div className="text-[5px] text-slate-400 uppercase tracking-widest leading-none">Device Ready</div>
          <div className="text-[6px] font-bold text-emerald-400 mt-1 leading-none">Standby - Idle</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-500 select-none items-center justify-center p-3 text-center">
      <div className="text-xl text-rose-500 animate-pulse">⚠️</div>
      <div className="text-[8px] font-black text-rose-500 uppercase tracking-wider mt-1">Expired / Off</div>
      <div className="text-[6.5px] text-slate-600 mt-0.5 leading-none">Sub Package Required</div>
    </div>
  );
}
