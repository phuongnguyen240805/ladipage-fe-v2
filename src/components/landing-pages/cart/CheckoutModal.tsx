"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "./CartContext";

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  paymentMethod: "cod" | "bank" | "momo";
}

const INITIAL_FORM: FormData = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  note: "",
  paymentMethod: "cod",
};

export const CheckoutModal: React.FC = () => {
  const { items, totalAmount, isCheckoutOpen, closeCheckout, clearCart } = useCart();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset khi mở lại
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep("form");
      setErrors({});
      setForm(INITIAL_FORM);
    }
  }, [isCheckoutOpen]);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
    if (!form.phone.trim() || !/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    if (!form.city.trim()) e.city = "Vui lòng nhập tỉnh / thành phố";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Giả lập API call
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setStep("success");
  }

  function handleClose() {
    if (step === "success") clearCart();
    closeCheckout();
  }

  if (!isCheckoutOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 820, maxHeight: "90vh", animation: "modalIn 0.25s ease-out" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {step === "success" ? (
          <SuccessView onClose={handleClose} />
        ) : (
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* ── Left: Form ── */}
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="text-xl">📋</span> Thông tin đặt hàng
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ và tên */}
                <Field
                  label="Họ và tên *"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                  error={errors.fullName}
                  placeholder="Nguyễn Văn A"
                />

                {/* SĐT */}
                <Field
                  label="Số điện thoại *"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  error={errors.phone}
                  placeholder="0901 234 567"
                />

                {/* Địa chỉ */}
                <Field
                  label="Địa chỉ giao hàng *"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  error={errors.address}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện"
                />

                {/* Tỉnh thành */}
                <Field
                  label="Tỉnh / Thành phố *"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                  error={errors.city}
                  placeholder="Hà Nội"
                />

                {/* Ghi chú */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú đơn hàng</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Giao giờ hành chính, để đồ trước cửa..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 resize-none transition"
                  />
                </div>

                {/* Phương thức thanh toán */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Phương thức thanh toán</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { val: "cod", label: "💵 COD", sub: "Thanh toán khi nhận" },
                      { val: "bank", label: "🏦 Chuyển khoản", sub: "Tài khoản ngân hàng" },
                      { val: "momo", label: "💜 MoMo", sub: "Ví điện tử" },
                    ] as const).map(({ val, label, sub }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, paymentMethod: val })}
                        className={`rounded-xl border-2 p-2.5 text-left transition-all text-xs ${
                          form.paymentMethod === val
                            ? "border-slate-900 bg-slate-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-bold text-gray-800">{label}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5 leading-tight">{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>🛒 Đặt hàng — {formatVND(totalAmount)}</>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400">
                  🔒 Thông tin được bảo mật và chỉ dùng để xử lý đơn hàng
                </p>
              </form>
            </div>

            {/* ── Right: Order Summary ── */}
            <div
              className="md:w-72 p-6 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto flex-shrink-0"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-1.5">
                <span>🧾</span> Đơn hàng của bạn
              </h3>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gray-400">×{item.quantity}</span>
                        <span className="text-xs font-bold text-gray-900">
                          {(item.priceNum * item.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tạm tính</span>
                  <span>{formatVND(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Vận chuyển</span>
                  <span className="text-emerald-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-base">{formatVND(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-700">
                ✅ Giao hàng miễn phí toàn quốc<br />
                🔄 Đổi trả trong 7 ngày<br />
                📦 Đóng gói kỹ, không hư hỏng
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Field Component ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, error, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
        error
          ? "border-red-300 focus:ring-red-200 focus:border-red-400"
          : "border-gray-200 focus:ring-slate-900/20 focus:border-slate-400"
      }`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ── Success View ──────────────────────────────────────────────────────────────

const SuccessView: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="flex flex-col items-center justify-center gap-5 px-8 py-16 text-center">
    <div className="text-7xl animate-bounce">🎉</div>
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
      <p className="text-gray-500 text-sm leading-relaxed">
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xác nhận và liên hệ trong vòng <strong>5 phút</strong>.
        <br />Theo dõi đơn hàng qua SMS hoặc Zalo.
      </p>
    </div>
    <div className="w-full max-w-xs rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700 space-y-1.5">
      <div>✅ Đơn hàng đã được tiếp nhận</div>
      <div>📱 Xác nhận qua SĐT / Zalo</div>
      <div>🚀 Giao hàng 2–4 ngày làm việc</div>
    </div>
    <button
      onClick={onClose}
      className="mt-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-700 transition-colors"
    >
      Đóng & tiếp tục mua sắm
    </button>
  </div>
);
