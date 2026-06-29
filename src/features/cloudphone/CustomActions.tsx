"use client";

import React, { useState, useEffect, useRef } from "react";

// --- Inline SVG Icons equivalent to Tabler Icons ---
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  );
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconStarFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconPlayerPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconPencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface CustomAction {
  id?: string;
  name: string;
  description: string;
  action_type: string;
  parameters: Record<string, any>;
  is_favorite?: boolean;
  updatedAt?: string;
}

const initialActions: CustomAction[] = [
  {
    id: "act-1",
    name: "Click Nút Nhận Thưởng",
    description: "Nhấp chuột tọa độ cố định của hộp quà trên màn hình để nhận thưởng hàng ngày.",
    action_type: "tap",
    parameters: { x: 540, y: 1220 },
    is_favorite: true,
    updatedAt: "16/06/2026",
  },
  {
    id: "act-2",
    name: "Vuốt Video TikTok Lên",
    description: "Vuốt từ dưới lên trên để chuyển đổi sang xem video kế tiếp trên bảng tin TikTok.",
    action_type: "swipe",
    parameters: { x: 500, y: 1500, endX: 500, endY: 400, duration: 600 },
    is_favorite: true,
    updatedAt: "15/06/2026",
  },
  {
    id: "act-3",
    name: "Điền mật khẩu clone",
    description: "Tự động nhập mật khẩu định sẵn vào ô nhập mật khẩu đăng nhập.",
    action_type: "type_text",
    parameters: { text: "MinPassword@123" },
    is_favorite: false,
    updatedAt: "14/06/2026",
  },
];

const actionTypes = [
  { value: "tap", label: "Touch / Tap" },
  { value: "double_tap", label: "Double Tap" },
  { value: "swipe", label: "Swipe / Scroll" },
  { value: "touch_and_hold", label: "Touch & Hold" },
  { value: "pinch", label: "Pinch Scale" },
  { value: "type_text", label: "Type Text" },
];

export default function CustomActions() {
  const [actions, setActions] = useState<CustomAction[]>(initialActions);
  const [deviceId, setDeviceId] = useState("");
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomAction | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState("tap");
  const [formParams, setFormParams] = useState<Record<string, any>>({ x: 200, y: 200 });

  // Coordinate picker screen state
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleFavorite = (id?: string) => {
    if (!id) return;
    setActions(actions.map((act) => act.id === id ? { ...act, is_favorite: !act.is_favorite } : act));
    const action = actions.find((act) => act.id === id);
    if (action) {
      showToast(action.is_favorite ? "Đã bỏ khỏi mục yêu thích" : "Đã thêm vào mục yêu thích");
    }
  };

  const openCreateModal = () => {
    setEditingAction(null);
    setFormName("Hành động tự chọn");
    setFormDesc("");
    setFormType("tap");
    setFormParams({ x: 200, y: 200 });
    setScreenshotUrl(null);
    setModalOpen(true);
  };

  const openEditModal = (act: CustomAction) => {
    setEditingAction(act);
    setFormName(act.name);
    setFormDesc(act.description);
    setFormType(act.action_type);
    setFormParams(act.parameters);
    setScreenshotUrl(null);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert("Vui lòng nhập tên hành động.");
      return;
    }

    if (editingAction) {
      setActions(
        actions.map((act) =>
          act.id === editingAction.id
            ? {
                ...act,
                name: formName,
                description: formDesc,
                action_type: formType,
                parameters: formParams,
                updatedAt: "16/06/2026",
              }
            : act
        )
      );
      showToast("Cập nhật hành động thành công!");
    } else {
      const newAct: CustomAction = {
        id: `act-${Date.now()}`,
        name: formName,
        description: formDesc,
        action_type: formType,
        parameters: formParams,
        is_favorite: false,
        updatedAt: "16/06/2026",
      };
      setActions([newAct, ...actions]);
      showToast("Tạo hành động thành công!");
    }
    setModalOpen(false);
  };

  const handleDelete = (act: CustomAction) => {
    setDeleteTarget(act);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setActions(actions.filter((act) => act.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("Xóa hành động thành công!");
  };

  const handleRun = (act: CustomAction) => {
    if (!deviceId.trim()) {
      showToast("Lỗi: Vui lòng nhập Device ID để kiểm thử hành động.");
      return;
    }
    showToast(`Đã gửi lệnh chạy "${act.name}" đến thiết bị ID "${deviceId}"`);
  };

  const captureMockScreenshot = () => {
    if (!deviceId.trim()) {
      alert("Vui lòng điền Device ID trước khi chụp ảnh màn hình.");
      return;
    }
    setPickerLoading(true);
    setTimeout(() => {
      // Set a premium mock android home screen image
      setScreenshotUrl("https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=720&q=80");
      setPickerLoading(false);
    }, 800);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    // Simulate coordinates based on standard full HD resolution (1080 x 2400)
    const scaleX = 1080 / rect.width;
    const scaleY = 2400 / rect.height;
    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    if (formType === "swipe") {
      if (formParams.x === undefined || formParams.endX !== undefined) {
        // First click sets start coords
        setFormParams({ x: clickX, y: clickY });
      } else {
        // Second click sets end coords
        setFormParams({ ...formParams, endX: clickX, endY: clickY, duration: 500 });
      }
    } else {
      setFormParams({ x: clickX, y: clickY });
    }
  };

  const formatParams = (act: CustomAction) => {
    const p = act.parameters;
    if (act.action_type === "type_text") return `Nhập text: "${p.text || ""}"`;
    if (act.action_type === "swipe") return `Vuốt: (${p.x ?? 0}, ${p.y ?? 0}) ➔ (${p.endX ?? 0}, ${p.endY ?? 0})`;
    if (act.action_type === "touch_and_hold") return `Nhấn giữ: (${p.x ?? 0}, ${p.y ?? 0}), ${p.duration ?? 1000}ms`;
    if (act.action_type === "pinch") return `Pinch: (${p.x ?? 0}, ${p.y ?? 0}), scale ${p.scale ?? 1}`;
    return `Click: (${p.x ?? 0}, ${p.y ?? 0})`;
  };

  const favorites = actions.filter((act) => act.is_favorite);
  const normalActions = actions.filter((act) => !act.is_favorite);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none relative">
      {/* Toast Notification overlay */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-slate-900 border border-slate-800 text-white px-5 py-3 text-xs font-extrabold shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          {toastMsg}
        </div>
      )}

      {/* Top Banner Toolbar */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px_160px] items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Custom Actions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Tạo thư viện hành động cử chỉ thiết bị tái sử dụng. Tự động lấy tọa độ chính xác bằng cách nhấn lên ảnh chụp màn hình điện thoại.
            </p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Nhập ID điện thoại để chụp màn hình..."
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow transition cursor-pointer active:scale-95 w-full"
          >
            <IconPlus className="h-4.5 w-4.5" />
            <span>Tạo hành động</span>
          </button>
        </div>
      </div>

      {/* Action Sections */}
      <div className="space-y-6">
        {/* Favorites section */}
        {favorites.length > 0 && (
          <div className="space-y-3.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-500">Hành động yêu thích ({favorites.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  isFav={true}
                  onToggleFav={() => handleToggleFavorite(act.id)}
                  onEdit={() => openEditModal(act)}
                  onDelete={() => handleDelete(act)}
                  onRun={() => handleRun(act)}
                  formatParams={formatParams}
                />
              ))}
            </div>
          </div>
        )}

        {/* Normal Actions section */}
        <div className="space-y-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Tất cả hành động ({normalActions.length})</h2>
          {normalActions.length === 0 ? (
            <p className="text-xs text-slate-400 font-bold">Không có hành động thông thường khác. Đánh dấu hình ngôi sao để đưa lên danh sách yêu thích.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalActions.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  isFav={false}
                  onToggleFav={() => handleToggleFavorite(act.id)}
                  onEdit={() => openEditModal(act)}
                  onDelete={() => handleDelete(act)}
                  onRun={() => handleRun(act)}
                  formatParams={formatParams}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#11121b] border border-gray-200 dark:border-gray-800/80 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                {editingAction ? "Chỉnh sửa hành động cử chỉ" : "Tạo hành động cử chỉ mới"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-500 cursor-pointer"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Content pane */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Form fields settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Tên hành động</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Loại cử chỉ</label>
                    <select
                      value={formType}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        setFormType(nextType);
                        setFormParams(
                          nextType === "type_text"
                            ? { text: "" }
                            : nextType === "swipe"
                              ? { x: 200, y: 500, endX: 200, endY: 200, duration: 500 }
                              : { x: 200, y: 200 }
                        );
                      }}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                    >
                      {actionTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Mô tả chi tiết</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Coordinate dynamic parameters input */}
                {formType !== "type_text" ? (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">Tọa độ cấu hình</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400">X</label>
                        <input
                          type="number"
                          value={formParams.x ?? 0}
                          onChange={(e) => setFormParams({ ...formParams, x: Number(e.target.value) })}
                          className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400">Y</label>
                        <input
                          type="number"
                          value={formParams.y ?? 0}
                          onChange={(e) => setFormParams({ ...formParams, y: Number(e.target.value) })}
                          className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                        />
                      </div>

                      {formType === "swipe" && (
                        <>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400">End X</label>
                            <input
                              type="number"
                              value={formParams.endX ?? 0}
                              onChange={(e) => setFormParams({ ...formParams, endX: Number(e.target.value) })}
                              className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400">End Y</label>
                            <input
                              type="number"
                              value={formParams.endY ?? 0}
                              onChange={(e) => setFormParams({ ...formParams, endY: Number(e.target.value) })}
                              className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-bold text-slate-400">Thời gian vuốt (ms)</label>
                            <input
                              type="number"
                              value={formParams.duration ?? 500}
                              onChange={(e) => setFormParams({ ...formParams, duration: Number(e.target.value) })}
                              className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                            />
                          </div>
                        </>
                      )}

                      {formType === "touch_and_hold" && (
                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-slate-400">Thời gian nhấn giữ (ms)</label>
                          <input
                            type="number"
                            value={formParams.duration ?? 1000}
                            onChange={(e) => setFormParams({ ...formParams, duration: Number(e.target.value) })}
                            className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                          />
                        </div>
                      )}

                      {formType === "pinch" && (
                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-slate-400">Tỷ lệ thu phóng (Scale)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formParams.scale ?? 1.5}
                            onChange={(e) => setFormParams({ ...formParams, scale: Number(e.target.value) })}
                            className="w-full rounded-lg border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Chuỗi văn bản (Text to Type)</label>
                    <textarea
                      value={formParams.text ?? ""}
                      onChange={(e) => setFormParams({ text: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                      placeholder="Nhập chuỗi văn bản..."
                    />
                  </div>
                )}
              </div>

              {/* Screenshot picker preview side panel */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/10 min-h-[300px]">
                {deviceId ? (
                  !screenshotUrl ? (
                    <button
                      onClick={captureMockScreenshot}
                      disabled={pickerLoading}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white px-5 py-3 text-xs font-extrabold transition cursor-pointer disabled:opacity-40"
                    >
                      {pickerLoading ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang tải màn hình...
                        </>
                      ) : (
                        <>
                          <IconRefresh className="h-4.5 w-4.5" />
                          Chụp màn hình lấy tọa độ
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <div className="text-[11px] font-black text-slate-500 text-center uppercase tracking-wide">
                        {formType === "swipe"
                          ? "Nhấn điểm xuất phát (1), tiếp đó là điểm kết thúc (2)"
                          : "Nhấp chuột vào màn hình để tự động chèn tọa độ"}
                      </div>
                      <div className="relative w-full max-w-[280px] aspect-[9/18.5] rounded-3xl border border-slate-300 dark:border-slate-800 overflow-hidden bg-slate-900 select-none">
                        <img
                          ref={imgRef}
                          src={screenshotUrl}
                          alt="Device Screen Mock"
                          onClick={handleImageClick}
                          className="w-full h-full object-cover cursor-crosshair"
                        />
                        {/* Red Dot marker overlay */}
                        {formParams.x !== undefined && formParams.y !== undefined && (
                          <div
                            style={{
                              left: `${(formParams.x / 1080) * 100}%`,
                              top: `${(formParams.y / 2400) * 100}%`,
                            }}
                            className="absolute h-4.5 w-4.5 rounded-full bg-rose-600 border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[7px] font-black text-white"
                          >
                            1
                          </div>
                        )}
                        {/* Swipe end marker overlay */}
                        {formType === "swipe" && formParams.endX !== undefined && (
                          <div
                            style={{
                              left: `${(formParams.endX / 1080) * 100}%`,
                              top: `${(formParams.endY / 2400) * 100}%`,
                            }}
                            className="absolute h-4.5 w-4.5 rounded-full bg-indigo-600 border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[7px] font-black text-white"
                          >
                            2
                          </div>
                        )}
                      </div>
                      <button
                        onClick={captureMockScreenshot}
                        className="rounded-lg border border-gray-250 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 px-3 py-1.5 text-[10px] font-bold cursor-pointer transition"
                      >
                        Chụp lại màn hình
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-xs font-bold text-slate-400 px-4 text-center">
                    Hãy điền ID điện thoại ở thanh công cụ bên ngoài để mở tính năng nhấp chụp lấy tọa độ trực quan.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-gray-200 dark:border-gray-800 dark:hover:bg-slate-800 hover:bg-slate-100 px-4.5 py-2.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-extrabold text-white shadow transition cursor-pointer active:scale-95"
              >
                {editingAction ? "Cập nhật" : "Tạo hành động"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#11121b] border border-gray-200 dark:border-gray-800/80 p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Xóa hành động</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Bạn có thực sự muốn xóa hành động <strong>{deleteTarget.name}</strong>? Thao tác này sẽ loại bỏ nó vĩnh viễn khỏi thư viện cử chỉ của bạn.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-gray-200 dark:border-gray-800 px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-extrabold text-white transition cursor-pointer active:scale-95"
              >
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub Card Component
function ActionCard({ action, isFav, onToggleFav, onEdit, onDelete, onRun, formatParams }: any) {
  const isFavorite = Boolean(action.is_favorite);

  return (
    <div
      className={`rounded-2xl border p-4.5 flex flex-col justify-between transition hover:shadow-md ${
        isFav
          ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/50 shadow-sm"
          : "bg-white dark:bg-[#11121b] border-gray-150 dark:border-gray-800/80"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white truncate" title={action.name}>
              {action.name}
            </h3>
            {action.updatedAt && (
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Cập nhật: {action.updatedAt}
              </span>
            )}
          </div>
          <button
            onClick={onToggleFav}
            className={`transition shrink-0 cursor-pointer active:scale-90 ${
              isFavorite ? "text-amber-500" : "text-slate-350 dark:text-slate-650 hover:text-slate-550"
            }`}
          >
            {isFavorite ? <IconStarFilled className="h-5.5 w-5.5" /> : <IconStar className="h-5.5 w-5.5" />}
          </button>
        </div>

        {/* Labels chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-500 uppercase tracking-wide">
            {action.action_type}
          </span>
          <span className="rounded border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 truncate max-w-full font-mono">
            {formatParams(action)}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[3rem] line-clamp-3">
          {action.description || "Chưa có mô tả hành động."}
        </p>
      </div>

      <div className="mt-4 pt-1 flex items-center gap-1.5">
        <button
          onClick={onRun}
          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 leading-none cursor-pointer transition active:scale-95"
        >
          <IconPlayerPlay className="h-3.5 w-3.5" />
          <span>Test</span>
        </button>
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-550 transition cursor-pointer active:scale-95"
          title="Chỉnh sửa"
        >
          <IconPencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/20 text-rose-500 transition cursor-pointer active:scale-95"
          title="Xóa"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
