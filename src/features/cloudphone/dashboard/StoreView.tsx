import React, { useState } from "react";

export default function StoreView() {
  const storeDevices = [
    {
      id: 1,
      badge: "Sales 94%",
      image: "/images/note_8.png",
      name: "Samsung Galaxy Note 8",
      description: "ROM gốc Samsung Galaxy Note 8 ổn định, phù hợp chạy APP, treo Game 24/7, Chạy Trao đổi tương tác, Golike, và các tác vụ cơ bản",
      specs: [
        { label: "6 GB • 64GB", icon: "ram" },
        { label: "Android 9", icon: "android" },
        { label: "Chưa Root", icon: "shield", isRed: true }
      ],
      prices: {
        day: "7.560đ",
        week: "41.160đ",
        month: "151.200đ"
      },
      stock: 7,
      salesCount: "999+",
      available: true
    },
    {
      id: 2,
      badge: "Sales 94%",
      image: "/images/note_8.png",
      name: "Samsung Galaxy Note 8",
      description: "Note 8 Change Device hỗ trợ thay đổi thông số thiết bị, sao lưu (BackUp) và phục hồi (Restore) ứng dụng ,ổn định, phù hợp chạ...",
      specs: [
        { label: "6 GB • 64GB", icon: "ram" },
        { label: "Android 13", icon: "android" },
        { label: "Chưa Root", icon: "shield", isRed: true }
      ],
      prices: {
        day: "10.800đ",
        week: "58.800đ",
        month: "216.000đ"
      },
      stock: 3,
      salesCount: "999+",
      available: true
    },
    {
      id: 3,
      badge: "Sales 94%",
      image: "/images/emulator.png",
      name: "Cloud Emulator",
      description: "8 Core 8 GB RAM - MÁY TREO GAME Play Together | Roblox | FC Online | We Play | ...",
      specs: [
        { label: "8 GB • 32GB", icon: "ram" },
        { label: "Android Random", icon: "android" },
        { label: "Chưa Root", icon: "shield", isRed: true }
      ],
      prices: {
        day: "10.800đ",
        week: "58.800đ",
        month: "216.000đ"
      },
      stock: 1,
      salesCount: "999+",
      available: true
    },
    {
      id: 4,
      badge: "Sales 94%",
      image: "/images/s7.png",
      name: "Samsung Galaxy S7",
      description: "Android 13 - Samsung Galaxy S7 Android, phù hợp chạy APP, Trao đổi tương tác, Golike, Ads Click, và các tác vụ cơ bản",
      specs: [
        { label: "4 GB • 32", icon: "ram" },
        { label: "Android 13", icon: "android" },
        { label: "Chưa Root", icon: "shield", isRed: true }
      ],
      prices: {
        day: "7.128đ",
        week: "38.808đ",
        month: "142.560đ"
      },
      stock: 0,
      salesCount: "999+",
      available: false
    }
  ];

  return (
    <>
      {/* Top Banner and Rules Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[2.8fr_1.8fr]">
        {/* Left Column: B Tool Slider Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-black aspect-[21/9] flex items-center justify-center">
          <img
            src="/images/carousel/carousel-01.png"
            alt="B Tool Banner"
            className="h-full w-full object-cover"
          />
          {/* Slider indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-100" />
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
          </div>
        </div>

        {/* Right Column: Terms and Instructions */}
        <div className="rounded-2xl border border-amber-200/60 bg-[#fffcf6] dark:border-amber-950/20 dark:bg-amber-950/5 h-[200px] lg:h-auto lg:relative overflow-hidden">
          <div className="p-5 h-full overflow-y-auto scrollbar-thin lg:absolute lg:inset-0 flex flex-col justify-start">
            <ul className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>Người thuê chịu hoàn toàn trách nhiệm pháp lý và kỹ thuật về mọi hành vi, nội dung, phần mềm và tác vụ được thực hiện trên thiết bị thuê.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>MaxCloudPhone không kiểm soát, theo dõi, hoặc can thiệp vào hoạt động của người thuê trên thiết bị.</span>
              </li>
            </ul>

            <div className="mt-5 border-t border-dashed border-amber-200/50 pt-4">
              <h3 className="text-sm font-extrabold text-[#1877f2] dark:text-[#4299e1] mb-3">2. Mục đích sử dụng</h3>
              <ul className="space-y-3.5 text-xs font-semibold">
                <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1877f2]" />
                  <span>Dịch vụ chỉ cung cấp thiết bị điện thoại ảo (CloudPhone) nhằm phục vụ nhu cầu thử nghiệm phần mềm, kiểm thử ứng dụng, phát triển hệ thống... hợp pháp.</span>
                </li>
                <li className="flex items-start gap-2 text-rose-500 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>Nghiêm cấm sử dụng CloudPhone cho mục đích: phát tán mã độc, gian lận tài khoản, vi phạm pháp luật, spam, lừa đảo, tấn công mạng, seeding vi phạm.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {storeDevices.map((device) => {
          const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month">("day");

          return (
            <div
              key={device.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-[#11121b]"
            >
              {/* Top Sales Badge */}
              <div className="absolute left-0 top-0 z-10 rounded-br-xl bg-[#e53e3e] px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">
                {device.badge}
              </div>

              {/* Top Section: Phone Image and Prices */}
              <div className="p-4 pt-8 grid grid-cols-[1.1fr_0.9fr] gap-3">
                {/* Left side: Phone mockup image */}
                <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-2 min-h-[160px]">
                  <img
                    src={device.image}
                    alt={device.name}
                    className="max-h-[140px] max-w-full object-contain select-none"
                  />
                </div>

                {/* Right side: Rental Period Options */}
                <div className="flex flex-col gap-2">
                  <div className="text-center text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    Lựa Chọn Thuê
                  </div>

                  {(["day", "week", "month"] as const).map((period) => {
                    const periodNames = { day: "Thuê Ngày", week: "Thuê Tuần", month: "Thuê Tháng" };
                    const isSelected = selectedPeriod === period;
                    const borderCls = isSelected
                      ? "border-slate-800 dark:border-white shadow-sm"
                      : "border-gray-200 dark:border-gray-800";

                    return (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition cursor-pointer select-none group/btn ${borderCls}`}
                      >
                        {/* Custom Calendar Icon */}
                        <svg
                          className={`h-4.5 w-4.5 transition-colors ${
                            isSelected ? "text-amber-500" : "text-gray-400 group-hover/btn:text-gray-600 dark:group-hover/btn:text-gray-300"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span className="mt-1 text-[9px] font-black text-slate-500 dark:text-slate-400">
                          {periodNames[period]}
                        </span>
                        <span
                          className={`text-xs font-black transition-colors ${
                            isSelected ? "text-amber-500" : "text-slate-800 dark:text-white"
                          }`}
                        >
                          {device.prices[period]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Section: Text Info & Specs */}
              <div className="px-4 pb-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#c2410c] dark:text-[#f97316] mb-1.5">
                    {device.name}
                  </h3>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 mb-3.5 line-clamp-3">
                    {device.description}
                  </p>

                  {/* Specs Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {device.specs.map((spec, index) => {
                      const badgeCls = spec.isRed
                        ? "border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-950/20 dark:bg-rose-950/10"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300";
                      return (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeCls}`}
                        >
                          {spec.icon === "ram" && "⚙️"}
                          {spec.icon === "android" && "🤖"}
                          {spec.icon === "shield" && "🛡️"}
                          {spec.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stock Info & Gift Button */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="text-[11px] font-black">
                    {device.available ? (
                      <span className="text-emerald-500">Còn hàng: {device.stock}</span>
                    ) : (
                      <span className="text-rose-500">Đang tạm hết</span>
                    )}
                    <span className="text-slate-400"> | Đã bán: {device.salesCount}</span>
                  </div>

                  <button className="flex flex-col items-center justify-center bg-[#e53e3e] hover:bg-[#c53030] text-white px-2.5 py-1.5 rounded-xl font-black text-center cursor-pointer transition select-none leading-none shadow-sm shadow-[#e53e3e]/20">
                    <span className="text-[8px] tracking-wide uppercase opacity-90">Quà tặng</span>
                    <span className="text-[9px] mt-0.5 tracking-tight uppercase">Tặng tool tiktok</span>
                  </button>
                </div>
              </div>

              {/* Bottom solid bar button */}
              {device.available ? (
                <button className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition select-none cursor-pointer">
                  <span>Thuê ngay</span>
                  <span className="text-sm">➔</span>
                </button>
              ) : (
                <button className="w-full bg-amber-500/10 border-t border-amber-500/20 text-amber-600 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center transition select-none cursor-pointer">
                  Liên hệ đặt trước
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
