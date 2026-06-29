import React from "react";

interface SalesSidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

const ordersNav = [
  { id: "orders", label: "Danh sách", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { id: "incomplete", label: "Chưa hoàn tất", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  )},
  { id: "deliveries", label: "Phiếu giao hàng", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V8.25m-14.75 6h10.5m-10.5 0v-6.75A2.25 2.25 0 015.25 5.25h10.5A2.25 2.25 0 0118 7.5v6.75m-12 0h9" />
    </svg>
  )},
  { id: "order-tags", label: "Tag đơn hàng", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.592 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )},
  { id: "order-custom-fields", label: "Trường tuỳ chỉnh", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
  )},
];

const productsNav = [
  { id: "products", label: "Danh sách", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )},
  { id: "categories", label: "Danh mục", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
  { id: "product-tags", label: "Tag sản phẩm", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.592 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )},
  { id: "inventory", label: "Tồn kho", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )},
  { id: "reviews", label: "Đánh giá", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.39.73-.39.925 0l2.352 4.766 5.26 1.008c.437.084.611.62.296.93l-3.834 3.734 1.008 5.258c.084.437-.37.766-.767.56L12 18.25l-4.707 2.47c-.397.205-.851-.124-.767-.56L7.54 15.01l-3.834-3.734c-.315-.31-.141-.847.296-.93l5.258-1.008L11.48 3.5z" />
    </svg>
  )},
  { id: "product-custom-fields", label: "Trường tuỳ chỉnh", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
  )},
];

export const SalesSidebar: React.FC<SalesSidebarProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="w-full lg:w-60 bg-[#f4f4fa] dark:bg-[#13141f] border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full p-4 overflow-y-auto">
      {/* Title */}
      <h2 className="text-[17px] font-bold text-slate-800 dark:text-white px-2 mb-4">
        Bán hàng
      </h2>

      {/* Orders Group */}
      <div className="space-y-1.5 mb-6">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
          Đơn hàng
        </span>
        <nav className="space-y-1">
          {ordersNav.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative group ${
                  isActive 
                    ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300 font-semibold" 
                    : "text-slate-650 hover:bg-gray-200/50 dark:text-slate-400 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? "text-[#65a30d] dark:text-lime-300" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-350"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-lime-500 dark:bg-lime-400 rounded-r-md" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Products Group */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
          Sản phẩm
        </span>
        <nav className="space-y-1">
          {productsNav.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative group ${
                  isActive 
                    ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300 font-semibold" 
                    : "text-slate-650 hover:bg-gray-200/50 dark:text-slate-400 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? "text-[#65a30d] dark:text-lime-300" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-350"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-lime-500 dark:bg-lime-400 rounded-r-md" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
