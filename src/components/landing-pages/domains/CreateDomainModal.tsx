import React, { useEffect, useState } from "react";
import { IconX } from "../dung-chung/icons";

/** Default hostname for free-domain customer-domain testing. */
export const TEST_CUSTOMER_DOMAIN_HINT = "ladipage.publicvm.com";

interface CreateDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDomain: (name: string, platform: string) => void | Promise<void>;
  /** Prefill / quick-add target for local free-domain tests */
  testHostname?: string;
  cnameTarget?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export const CreateDomainModal: React.FC<CreateDomainModalProps> = ({
  isOpen,
  onClose,
  onCreateDomain,
  testHostname = TEST_CUSTOMER_DOMAIN_HINT,
  cnameTarget,
  isSubmitting = false,
  errorMessage = null,
}) => {
  const [domainName, setDomainName] = useState("");
  const [platform, setPlatform] = useState("LadiPage");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = domainName.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!name) {
      setLocalError("Vui lòng nhập tên miền.");
      return;
    }
    if (!name.includes(".")) {
      setLocalError("Tên miền phải có dạng example.com (có dấu chấm).");
      return;
    }
    setLocalError(null);
    await onCreateDomain(name, platform);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setDomainName("");
    setLocalError(null);
    onClose();
  };

  const displayError = localError || errorMessage;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Tạo tên miền mới
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 p-1 cursor-pointer disabled:opacity-50"
          >
            <IconX size={16} />
          </button>
        </div>

        {testHostname ? (
          <div className="rounded-lg border border-lime-200 bg-lime-50/80 px-3 py-2.5 text-xs text-slate-700 dark:border-lime-900 dark:bg-lime-950/30 dark:text-slate-300">
            <p className="font-semibold text-lime-800 dark:text-lime-200">Test free domain</p>
            <p className="mt-1 leading-relaxed">
              Gợi ý: thêm <code className="font-mono text-[11px]">{testHostname}</code>
              {cnameTarget ? (
                <>
                  {" "}
                  — sau đó CNAME hostname con →{" "}
                  <code className="font-mono text-[11px]">{cnameTarget}</code>
                </>
              ) : null}
              .
            </p>
            <button
              type="button"
              onClick={() => setDomainName(testHostname)}
              className="mt-2 text-[11px] font-bold text-lime-700 underline hover:text-lime-900 dark:text-lime-300"
            >
              Điền sẵn {testHostname}
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tên miền
            </label>
            <input
              type="text"
              placeholder={`Ví dụ: ${testHostname || "www.mybrand.com"}`}
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400 font-mono"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nền tảng liên kết
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-hidden focus:border-lime-400 cursor-pointer"
            >
              <option value="LadiPage">LadiPage</option>
              <option value="WordPress">WordPress</option>
              <option value="Shopify">Shopify</option>
            </select>
          </div>

          {displayError ? (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{displayError}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4.5 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo…" : "Tạo tên miền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
