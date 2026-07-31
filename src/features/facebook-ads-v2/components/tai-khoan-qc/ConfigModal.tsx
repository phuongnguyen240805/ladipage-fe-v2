import React from "react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: "all" | "by-id" | "by-bm";
  setSourceType: (type: "all" | "by-id" | "by-bm") => void;
  accountFilter: "all" | "personal" | "bm";
  setAccountFilter: (filter: "all" | "personal" | "bm") => void;
  dataOptions: {
    financial: boolean;
    insights: boolean;
    adminRights: boolean;
    timestamps: boolean;
    hiddenAccounts: boolean;
    payments: boolean;
  };
  setDataOptions: React.Dispatch<
    React.SetStateAction<{
      financial: boolean;
      insights: boolean;
      adminRights: boolean;
      timestamps: boolean;
      hiddenAccounts: boolean;
      payments: boolean;
    }>
  >;
  limitApi: number;
  setLimitApi: (limit: number) => void;
  onLoadData: () => void;
}

const sourceOptions = [
  { id: "all", title: "Tải toàn bộ", desc: "Quét toàn bộ TKQC hiện có" },
  { id: "by-id", title: "Tải theo ID", desc: "Tải theo danh sách ID TKQC" },
  { id: "by-bm", title: "Tải theo BM", desc: "Lấy TKQC theo danh sách BM ID" },
] as const;

const accountTypeOptions = [
  { id: "all", title: "Tất cả", desc: "Mặc định" },
  { id: "personal", title: "Cá nhân", desc: "Via/Clone" },
  { id: "bm", title: "BM", desc: "Business" },
] as const;

const dataOptionItems = [
  { key: "financial", label: "Tài chính", desc: "Số dư, ngưỡng, limit, tiền tệ" },
  { key: "insights", label: "Tổng tiêu", desc: "Insights tổng chi tiêu" },
  { key: "adminRights", label: "Admin & quyền", desc: "Số admin và quyền sở hữu" },
  { key: "timestamps", label: "Thời gian", desc: "Ngày tạo, hóa đơn, lý do khóa, múi giờ" },
  { key: "hiddenAccounts", label: "Tài khoản ẩn", desc: "Bao gồm cả tài khoản bị ẩn" },
  { key: "payments", label: "Thanh toán", desc: "Thông tin thẻ thanh toán" },
] as const;

export default function ConfigModal({
  isOpen,
  onClose,
  sourceType,
  setSourceType,
  accountFilter,
  setAccountFilter,
  dataOptions,
  setDataOptions,
  limitApi,
  setLimitApi,
  onLoadData,
}: ConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex animate-fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-all duration-300">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#11121e]">
        <div className="flex items-center justify-between border-b border-gray-150 px-6 py-4.5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-50 bg-lime-50 text-lime-500 dark:border-lime-900/30 dark:bg-lime-950/20 dark:text-lime-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">Cấu hình tải dữ liệu Ads</h3>
              <span className="text-[10px] text-gray-400 sm:text-xs">
                Thiết lập nguồn dữ liệu và tùy chọn trước khi tải tài khoản quảng cáo.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-850 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto p-6 text-left">
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">Nguồn dữ liệu</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {sourceOptions.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSourceType(source.id)}
                  className={`flex cursor-pointer flex-col rounded-xl border p-4.5 text-left transition-all ${
                    sourceType === source.id
                      ? "border-lime-400 bg-lime-50/40 text-lime-600 shadow-sm dark:border-lime-400 dark:bg-lime-950/10 dark:text-lime-300"
                      : "border-gray-150 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="mb-1 flex w-full items-center justify-between">
                    <span className="text-xs font-bold sm:text-sm">{source.title}</span>
                    {sourceType === source.id && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-white">
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{source.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">Loại tài khoản</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {accountTypeOptions.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAccountFilter(type.id)}
                  className={`flex cursor-pointer flex-col rounded-xl border p-4.5 text-left transition-all ${
                    accountFilter === type.id
                      ? "border-lime-400 bg-lime-50/40 text-lime-600 shadow-sm dark:border-lime-400 dark:bg-lime-950/10 dark:text-lime-300"
                      : "border-gray-150 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="mb-1 flex w-full items-center justify-between">
                    <span className="text-xs font-bold sm:text-sm">{type.title}</span>
                    {accountFilter === type.id && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-white">
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">Tùy chọn dữ liệu</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {dataOptionItems.map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer select-none items-start gap-3 rounded-xl border border-gray-150 bg-gray-50/50 p-3.5 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:bg-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={dataOptions[option.key]}
                    onChange={(event) =>
                      setDataOptions((previousOptions) => ({
                        ...previousOptions,
                        [option.key]: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4.5 w-4.5 cursor-pointer rounded text-lime-500 focus:ring-lime-400"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight text-gray-800 dark:text-gray-200 sm:text-sm">
                      {option.label}
                    </span>
                    <span className="mt-0.5 text-[10px] text-gray-400">{option.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-150 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 sm:text-sm">Giới hạn mỗi trang (Limit API)</span>
              <span className="mt-0.5 text-[10px] text-gray-400">Số lượng Ads tối đa mỗi lần gọi API phân trang</span>
            </div>
            <input
              type="number"
              value={limitApi}
              onChange={(event) => setLimitApi(Number(event.target.value))}
              className="w-24 rounded-xl border border-gray-150 bg-white px-3 py-2 text-center text-xs font-semibold focus:border-lime-400 focus:outline-none dark:border-gray-800 dark:bg-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3.5 border-t border-gray-150 bg-gray-50 px-6 py-4.5 dark:border-gray-800 dark:bg-gray-900/60">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer select-none rounded-xl bg-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onLoadData}
            className="flex cursor-pointer select-none items-center gap-2 rounded-xl bg-lime-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-lime-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Tải dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
}
