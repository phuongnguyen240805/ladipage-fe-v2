import React, { useState, useEffect } from "react";
import { FlowItem } from "../dung-chung/types";
import { IconBolt, IconCheck, IconPlus, IconTrash } from "../dung-chung/icons";

interface FlowBuilderProps {
  flowId: string | null;
  flows: FlowItem[];
  setFlows: React.Dispatch<React.SetStateAction<FlowItem[]>>;
  onBack: () => void;
}

const TRIGGER_OPTIONS = [
  { id: "register", name: "Đăng ký mới", desc: "Kích hoạt khi khách hàng điền form đăng ký mới từ Landing Page." },
  { id: "webhook_n8n", name: "n8n Webhook Listener", desc: "Lắng nghe payload JSON đẩy từ n8n workflow tự động." },
  { id: "tag_added", name: "Được gắn Tag", desc: "Kích hoạt khi khách hàng được gắn một Tag phân loại cụ thể." },
  { id: "tag_removed", name: "Bị xóa Tag", desc: "Kích hoạt khi khách hàng bị xóa khỏi một Tag phân loại." },
  { id: "sequence_join", name: "Đăng ký Sequence", desc: "Kích hoạt khi khách hàng bắt đầu chuỗi chăm sóc tự động." },
];

const ACTION_OPTIONS = [
  { id: "send_zalo", name: "Gửi tin nhắn Zalo ZNS", desc: "Gửi tin nhắn OA chính thống chăm sóc khách hàng tự động.", icon: "Z", color: "bg-lime-400", previewType: "zalo" },
  { id: "send_email", name: "Gửi Email tự động", desc: "Gửi email HTML chào mừng, xác nhận thông tin hay nuôi dưỡng.", icon: "E", color: "bg-indigo-500", previewType: "email" },
  { id: "send_sms", name: "Gửi SMS Brandname", desc: "Gửi tin nhắn SMS Brandname viễn thông nhanh, xác thực OTP.", icon: "S", color: "bg-purple-600", previewType: "sms" },
  { id: "chatgpt_node", name: "ChatGPT (OpenAI AI)", desc: "Gọi OpenAI GPT-4o xử lý, tóm tắt hoặc phản hồi khách hàng tự động.", icon: "AI", color: "bg-emerald-500", previewType: "chatgpt" },
  { id: "telegram_node", name: "Gửi thông báo Telegram", desc: "Đẩy tin nhắn cảnh báo hoặc báo cáo tức thì vào Telegram.", icon: "TG", color: "bg-[#229ED9]", previewType: "telegram" },
  { id: "add_tag", name: "Tự động gắn Tag", desc: "Thêm thẻ Tag phân loại khách hàng tự động vào cơ sở dữ liệu.", icon: "T", color: "bg-amber-500", previewType: "tag" },
  { id: "sync_sheet", name: "Đồng bộ Google Sheet", desc: "Ghi thêm thông tin khách hàng sang bảng tính Google Sheet trực tuyến.", icon: "G", color: "bg-emerald-600", previewType: "sheet" },
];

export const FlowBuilder: React.FC<FlowBuilderProps> = ({
  flowId,
  flows,
  setFlows,
  onBack,
}) => {
  const [flowName, setFlowName] = useState("Flow-1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");
  const [selectedTrigger, setSelectedTrigger] = useState<typeof TRIGGER_OPTIONS[0] | null>(null);
  const [selectedAction, setSelectedAction] = useState<typeof ACTION_OPTIONS[0] | null>(null);
  const [panelMode, setPanelMode] = useState<"none" | "trigger" | "action">("none");
  const [isSaved, setIsSaved] = useState(true);

  // Custom node parameter states
  const [actionParams, setActionParams] = useState<any>({
    model: "gpt-4o",
    systemPrompt: "Bạn là trợ lý chăm sóc khách hàng thân thiện của LadiPage.",
    userPrompt: "Hãy tạo lời chào mừng gửi tới khách hàng mới: {{customer_name}}",
    botToken: "",
    chatId: ""
  });

  // Load flow if editing
  useEffect(() => {
    const loadFlowData = async () => {
      if (!flowId) return;

      // Try fetching from Flowise
      try {
        const savedUrl = localStorage.getItem("flowise_url") || "http://localhost:3100";
        const res = await fetch(`/api/flowise/chatflows/${flowId}`, {
          headers: {
            "x-flowise-url": savedUrl,
          },
        });
        if (res.ok) {
          const cf = await res.json();
          setFlowName(cf.name);
          if (cf.flowData) {
            const parsed = JSON.parse(cf.flowData);
            const triggerNode = parsed.nodes?.find((n: any) => n.type === "trigger");
            const actionNode = parsed.nodes?.find((n: any) => n.type === "action");

            if (triggerNode) {
              const matchedTrigger = TRIGGER_OPTIONS.find((t) => t.id === triggerNode.data.id);
              if (matchedTrigger) setSelectedTrigger(matchedTrigger || null);
            }
            if (actionNode) {
              const matchedAction = ACTION_OPTIONS.find((a) => a.id === actionNode.data.id);
              if (matchedAction) {
                setSelectedAction(matchedAction || null);
                if (actionNode.params) {
                  setActionParams(actionNode.params);
                }
              }
            }
          }
          return; // Skip fallback
        }
      } catch (e) {
        console.warn("Failed to load flow from Flowise, using local fallback", e);
      }

      // Fallback local load
      const existing = flows.find((f) => f.id === flowId);
      if (existing) {
        setFlowName(existing.name);
        const matchedTrigger = TRIGGER_OPTIONS.find((t) => t.name === existing.triggerType);
        if (matchedTrigger) setSelectedTrigger(matchedTrigger);
        setSelectedAction(ACTION_OPTIONS[0]);
      }
    };

    loadFlowData();
  }, [flowId, flows]);

  const handleSave = async () => {
    setIsSaved(true);

    const flowDataObj = {
      nodes: [
        ...(selectedTrigger ? [{ id: "trigger", type: "trigger", data: selectedTrigger }] : []),
        ...(selectedAction ? [{ id: "action", type: "action", data: selectedAction, params: actionParams }] : [])
      ],
      edges: selectedTrigger && selectedAction ? [
        { id: "e1-2", source: "trigger", target: "action" }
      ] : []
    };

    const flowBody = {
      name: flowName,
      flowData: JSON.stringify(flowDataObj),
      deployed: false,
    };

    let savedId = flowId;
    let success = false;

    try {
      const savedUrl = localStorage.getItem("flowise_url") || "http://localhost:3100";
      const isEdit = !!flowId;
      const url = isEdit ? `/api/flowise/chatflows/${flowId}` : `/api/flowise/chatflows`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-flowise-url": savedUrl,
        },
        body: JSON.stringify(flowBody),
      });

      if (res.ok) {
        const data = await res.json();
        savedId = data.id || flowId;
        success = true;
      }
    } catch (e) {
      console.error("Failed to save to Flowise:", e);
    }

    const flowItem: FlowItem = {
      id: savedId || `flow-${Date.now()}`,
      name: flowName,
      status: "INACTIVE",
      createdAt: new Date().toLocaleString("vi-VN"),
      triggerType: selectedTrigger ? selectedTrigger.name : "Chưa thiết lập",
    };

    setFlows((prev) => {
      const exists = prev.some((f) => f.id === flowItem.id);
      if (exists) {
        return prev.map((f) => (f.id === flowItem.id ? flowItem : f));
      }
      return [flowItem, ...prev];
    });

    // Save to local storage for persistent fallback
    setTimeout(() => {
      const updated = flows.some(f => f.id === flowItem.id)
        ? flows.map(f => f.id === flowItem.id ? flowItem : f)
        : [flowItem, ...flows];
      localStorage.setItem("local_flows", JSON.stringify(updated));
    }, 100);

    alert(success ? "Đã lưu kịch bản vào Flowise thành công!" : "Không kết nối được Flowise. Đã lưu kịch bản vào bộ nhớ trình duyệt tạm thời.");
  };

  const handleSelectTrigger = (trigger: typeof TRIGGER_OPTIONS[0]) => {
    setSelectedTrigger(trigger);
    setPanelMode("none");
    setIsSaved(false);
  };

  const handleSelectAction = (action: typeof ACTION_OPTIONS[0]) => {
    setSelectedAction(action);
    setPanelMode("none");
    setIsSaved(false);
  };

  const handleClearTrigger = () => {
    setSelectedTrigger(null);
    setIsSaved(false);
  };

  const handleClearAction = () => {
    setSelectedAction(null);
    setIsSaved(false);
  };

  const renderPhonePreview = () => {
    if (!selectedAction) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 dark:text-slate-500">
          <svg className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          <p className="text-[10px] font-bold">Xem trước tin nhắn</p>
          <p className="text-[9px] mt-1 max-w-[150px]">Thiết lập hành động gửi tin nhắn hoặc email để xem trước nội dung hiển thị tại đây.</p>
        </div>
      );
    }

    switch (selectedAction.previewType) {
      case "email":
        return (
          <div className="flex flex-col h-full bg-gray-50 text-slate-800 text-[9px] font-sans">
            <div className="bg-white border-b border-gray-150 p-2 space-y-0.5">
              <div className="flex justify-between text-[8px] text-slate-450">
                <span>Hộp thư đến</span>
                <span>Bây giờ</span>
              </div>
              <div className="font-bold text-slate-850">Xác nhận thông tin đăng ký tư vấn</div>
              <div className="text-[7px] text-slate-400">Người gửi: support@ladipage.vn</div>
            </div>
            <div className="flex-1 p-2.5 overflow-y-auto bg-white m-2 rounded border border-gray-100/80 shadow-3xs whitespace-pre-line leading-relaxed text-[8px]">
              {"Xin chào Khách hàng,\n\nCảm ơn bạn đã quan tâm đăng ký thông tin tư vấn chiến lược. Yêu cầu của bạn đã được nhận.\n\nThông tin chi tiết sẽ được gửi tiếp theo.\n\nTrân trọng!"}
            </div>
          </div>
        );
      case "zalo":
        return (
          <div className="flex flex-col h-full bg-[#eef3f7] text-slate-800 text-[10px] font-sans">
            <div className="bg-[#65a30d] text-white p-2 flex items-center gap-1.5 shadow-3xs">
              <div className="w-4.5 h-4.5 rounded-full bg-white text-[#65a30d] flex items-center justify-center font-black text-[9px]">
                Z
              </div>
              <div>
                <div className="font-bold text-[9px]">Zalo OA Support</div>
                <div className="text-[7px] opacity-75">Đang trực tuyến</div>
              </div>
            </div>
            <div className="flex-1 p-2.5 overflow-y-auto space-y-2">
              <div className="bg-white p-2.5 rounded-lg border border-gray-250/60 shadow-3xs space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-gray-100 pb-1 text-[10px]">
                  Xác nhận khách hàng VIP
                </div>
                <div className="text-slate-650 text-[8.5px] leading-relaxed">
                  {"Xin chào Quý khách,\n\nTài khoản của bạn đã được tích hợp thành công trên hệ thống tự động hóa chăm sóc khách hàng LadiPage.\n\nChúc quý khách có trải nghiệm tốt nhất!"}
                </div>
                <button className="w-full bg-lime-50 text-lime-500 font-bold py-1.5 rounded-md text-[8px] hover:bg-lime-50 transition">
                  Kết nối OA ngay
                </button>
              </div>
            </div>
          </div>
        );
      case "chatgpt":
        return (
          <div className="flex flex-col h-full bg-[#1e1e24] text-white font-sans text-[9px] select-none">
            {/* ChatGPT Header */}
            <div className="bg-[#2a2b36] p-2 flex items-center gap-1.5 border-b border-white/5">
              <span className="w-4 h-4 rounded-full bg-[#10a37f] text-white flex items-center justify-center font-bold text-[8px]">
                🤖
              </span>
              <div>
                <div className="font-bold text-[8.5px] text-[#10a37f]">GPT-4o Agent</div>
                <div className="text-[6px] text-slate-400 leading-none">Đang xử lý prompt...</div>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-[#343541] text-left">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prompt gửi đi</span>
                <span className="text-slate-355 leading-normal block text-[8px]">
                  {actionParams.userPrompt || "Tạo lời chào mừng gửi tới khách hàng..."}
                </span>
              </div>
              <div className="bg-[#10a37f]/10 p-2 rounded-lg border border-[#10a37f]/20">
                <span className="text-[6.5px] font-bold text-[#10a37f] uppercase tracking-wider block mb-1">AI Phản hồi</span>
                <span className="text-[#a7f3d0] leading-normal block text-[8px] font-medium animate-pulse">
                  {"[AI] Xin chào! Rất vui được hỗ trợ bạn..."}
                </span>
              </div>
            </div>
          </div>
        );
      case "telegram":
        return (
          <div className="flex flex-col h-full bg-[#549cce]/10 text-slate-800 dark:text-slate-200 font-sans text-[9px] relative select-none">
            {/* Telegram Header */}
            <div className="bg-[#549cce] text-white p-2 flex items-center gap-1.5 shadow-3xs">
              <span className="w-4 h-4 rounded-full bg-white text-[#549cce] flex items-center justify-center font-black text-[9px]">
                TG
              </span>
              <div>
                <div className="font-bold text-[9px]">Telegram Notify Bot</div>
                <div className="text-[6.5px] opacity-75 leading-none">bot công việc</div>
              </div>
            </div>
            {/* Chat Message Box */}
            <div className="flex-1 p-2 flex flex-col justify-end text-left">
              <div className="max-w-[90%] bg-white dark:bg-gray-850 p-2.5 rounded-xl rounded-bl-none text-[8px] leading-relaxed border border-gray-150 dark:border-gray-800/80 shadow-3xs">
                <span className="text-[7px] text-[#549cce] font-bold block mb-0.5">🔔 BÁO CÁO AUTOMATION</span>
                Hành động kích hoạt: <strong>{selectedTrigger?.name || "Đăng ký mới"}</strong>.
                <br />
                Đang xử lý tiếp theo trong chuỗi kịch bản.
              </div>
              <span className="text-[6px] text-slate-400 mt-0.5 ml-1">Vừa xong</span>
            </div>
          </div>
        );
      case "sms":
        return (
          <div className="flex flex-col h-full bg-slate-950 text-white font-sans text-[9px]">
            <div className="bg-slate-900 p-2 flex items-center gap-1.5 border-b border-slate-800/80">
              <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold">
                OTP
              </div>
              <div>
                <div className="font-bold text-[8px]">Brandname-OTP</div>
                <div className="text-[6px] text-slate-400">SMS viễn thông</div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-end">
              <div className="max-w-[85%] bg-slate-800 p-2 rounded-xl rounded-bl-none text-[8.5px] leading-relaxed border border-slate-700/60 shadow-3xs">
                (BRAND-OTP) Ma OTP xac thuc tai khoan cua ban la {Math.floor(100000 + Math.random() * 900000)}. Vui long khong chia se ma nay.
              </div>
              <span className="text-[6px] text-slate-500 mt-0.5 ml-1">Vừa xong</span>
            </div>
          </div>
        );
      case "tag":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-700 dark:text-slate-350">
            <svg className="w-10 h-10 text-amber-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.59 0l4.317-4.317a1.125 1.125 0 000-1.59L9.568 3.659A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p className="text-[9.5px] font-bold">Hành động nội bộ: Gắn Tag</p>
            <p className="text-[8.5px] text-slate-500 dark:text-slate-400 mt-1">Hệ thống sẽ gắn thẻ tag tương ứng để định danh khách hàng mà không gửi tin nhắn trực tiếp.</p>
          </div>
        );
      case "sheet":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-700 dark:text-slate-350 font-sans">
            <svg className="w-10 h-10 text-emerald-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0-.621-.504-1.125-1.125-1.125m1.125 2.625h-1.5a1.125 1.125 0 01-1.125-1.125m-13.5-3.75h13.5m-13.5-3.75h13.5m-13.5-3.75h13.5m-.375-3.75h1.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125z" />
            </svg>
            <p className="text-[9.5px] font-bold">Đồng bộ dữ liệu bảng tính</p>
            <p className="text-[8.5px] text-slate-500 dark:text-slate-400 mt-1">Đồng bộ thông tin khách hàng sang các cột chỉ định trên Google Sheet thời gian thực.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] -m-6 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition cursor-pointer"
            title="Quay lại danh sách"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-sm hidden md:inline select-none">Flows</span>
            <span className="text-slate-300 text-sm hidden md:inline select-none">/</span>
            {isEditingName ? (
              <input
                type="text"
                value={flowName}
                onChange={(e) => {
                  setFlowName(e.target.value);
                  setIsSaved(false);
                }}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingName(false);
                }}
                className="text-sm font-bold text-slate-800 dark:text-white bg-gray-50 dark:bg-gray-850 border border-lime-400 rounded px-2 py-0.5 outline-hidden"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {flowName}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-0.5 text-slate-400 hover:text-lime-500 cursor-pointer rounded"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: List/Diagram toggle */}
        <div className="bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg flex items-center">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              activeTab === "list"
                ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              activeTab === "chart"
                ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Biểu đồ
          </button>
        </div>

        {/* Right: Save & Publish */}
        <div className="flex items-center gap-3">
          <span className={`text-xs flex items-center gap-1.5 ${isSaved ? "text-green-600 dark:text-green-450" : "text-slate-450"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSaved ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
            <span>{isSaved ? "Đã lưu" : "Có thay đổi chưa lưu"}</span>
          </span>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
              isSaved
                ? "bg-gray-100 dark:bg-gray-800 text-slate-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
                : "bg-lime-500 hover:bg-lime-600 text-white"
            }`}
          >
            Lưu nháp
          </button>
          <button
            disabled={!selectedTrigger || !selectedAction}
            onClick={() => {
              alert(`Kịch bản "${flowName}" đã được xuất bản chính thức vào sản xuất! Hệ thống bắt đầu lắng nghe sự kiện.`);
              onBack();
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
              !selectedTrigger || !selectedAction
                ? "bg-gray-100 dark:bg-gray-850 text-slate-400 border border-gray-200 dark:border-gray-800 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            Xuất bản
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="flex-1 overflow-hidden flex flex-row">
        {/* Tab 1: List Workspace */}
        {activeTab === "list" ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Cột 1: Workflow Setup Panel */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center">
              <div className="w-full max-w-md space-y-6 relative flex flex-col items-center">
                {/* Visual Connector Line */}
                <div className="absolute top-10 bottom-10 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2 -z-10" />

                {/* 1. Trigger Block */}
                <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs relative">
                  <div className="absolute -top-3.5 left-6 bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                    ⚡ TRIGGER
                  </div>
                  {selectedTrigger ? (
                    <div className="space-y-3 text-left">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {selectedTrigger.name}
                          </h3>
                          <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                            {selectedTrigger.desc}
                          </p>
                        </div>
                        <button
                          onClick={handleClearTrigger}
                          className="text-slate-400 hover:text-red-500 font-bold text-lg leading-none p-1 cursor-pointer"
                          title="Xóa"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2.5">
                        {selectedTrigger.id === "webhook_n8n" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Webhook URL (n8n)</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="text" 
                                readOnly 
                                value={`http://localhost:3000/api/webhook/n8n-${flowId || "new"}`} 
                                className="w-full text-[9px] bg-slate-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-700 text-slate-500 p-2 rounded-lg outline-hidden font-mono select-all" 
                              />
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`http://localhost:3000/api/webhook/n8n-${flowId || "new"}`);
                                  alert("Đã sao chép Webhook URL vào Clipboard!");
                                }}
                                className="px-3 py-1 bg-lime-500 hover:bg-lime-600 text-white text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedTrigger.id === "register" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chọn Landing Page</label>
                            <select className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-350 outline-hidden">
                              <option>Landing Page - Tuyển dụng Đại lý CloudPhone</option>
                              <option>Landing Page - Đăng ký Gói Phần Mềm Dùng Thử</option>
                            </select>
                          </div>
                        )}
                        {selectedTrigger.id === "tag_added" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chọn Thẻ Tag Phân Loại</label>
                            <select className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-350 outline-hidden">
                              <option>VIP_CUSTOMER</option>
                              <option>LEAD_HOT</option>
                              <option>ZALO_MEMBER</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPanelMode(panelMode === "trigger" ? "none" : "trigger")}
                      className="w-full py-4 border-2 border-dashed border-gray-250 hover:border-lime-400 dark:border-gray-750 dark:hover:border-lime-400/80 rounded-xl text-slate-450 dark:text-slate-500 hover:text-lime-500 dark:hover:text-lime-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer bg-slate-50/20"
                    >
                      <IconPlus size={14} />
                      <span>Thêm sự kiện Trigger</span>
                    </button>
                  )}
                </div>
 
                {/* Flow connector arrow */}
                <div className="w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-full flex items-center justify-center shadow-3xs z-10">
                  <svg className="w-4 h-4 text-slate-450" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
 
                {/* 2. Action Block */}
                <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs relative">
                  <div className="absolute -top-3.5 left-6 bg-lime-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                    ⚙ HÀNH ĐỘNG
                  </div>
                  {selectedAction ? (
                    <div className="space-y-3 text-left">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${selectedAction.color} text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0`}>
                            {selectedAction.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                              {selectedAction.name}
                            </h3>
                            <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                              {selectedAction.desc}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearAction}
                          className="text-slate-400 hover:text-red-500 font-bold text-lg leading-none p-1 cursor-pointer"
                          title="Xóa"
                        >
                          ×
                        </button>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                        {selectedAction.id === "chatgpt_node" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OpenAI Model</label>
                              <select 
                                value={actionParams.model} 
                                onChange={(e) => {
                                  setActionParams({ ...actionParams, model: e.target.value });
                                  setIsSaved(false);
                                }}
                                className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-355 outline-hidden focus:border-lime-450 cursor-pointer"
                              >
                                <option value="gpt-4o">gpt-4o (Khuyên dùng)</option>
                                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                                <option value="o1-mini">o1-mini</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Instructions (Prompt hệ thống)</label>
                              <textarea 
                                value={actionParams.systemPrompt}
                                onChange={(e) => {
                                  setActionParams({ ...actionParams, systemPrompt: e.target.value });
                                  setIsSaved(false);
                                }}
                                rows={2}
                                className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden resize-none focus:border-lime-450 font-medium"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Prompt (Nội dung phân tích)</label>
                              <textarea 
                                value={actionParams.userPrompt}
                                onChange={(e) => {
                                  setActionParams({ ...actionParams, userPrompt: e.target.value });
                                  setIsSaved(false);
                                }}
                                rows={2}
                                className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden resize-none focus:border-lime-450 font-medium"
                              />
                            </div>
                          </>
                        )}

                        {selectedAction.id === "telegram_node" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telegram Bot Token</label>
                              <input 
                                type="password" 
                                value={actionParams.botToken || ""}
                                onChange={(e) => {
                                  setActionParams({ ...actionParams, botToken: e.target.value });
                                  setIsSaved(false);
                                }}
                                placeholder="5830219502:AAFvU..." 
                                className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden focus:border-lime-450" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chat ID (Nhóm hoặc Kênh)</label>
                              <input 
                                type="text" 
                                value={actionParams.chatId || ""}
                                onChange={(e) => {
                                  setActionParams({ ...actionParams, chatId: e.target.value });
                                  setIsSaved(false);
                                }}
                                placeholder="-100192837465" 
                                className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden focus:border-lime-450" 
                              />
                            </div>
                          </>
                        )}

                        {selectedAction.id === "send_zalo" && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mẫu ZNS OA</label>
                            <textarea 
                              defaultValue="Xin chào Quý khách,\nTài khoản của bạn đã được tích hợp thành công..." 
                              rows={2}
                              className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden resize-none focus:border-lime-450 font-medium"
                            />
                          </div>
                        )}

                        {selectedAction.id === "send_email" && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiêu đề Email</label>
                            <input 
                              type="text" 
                              defaultValue="Xác nhận thông tin đăng ký kịch bản tự động" 
                              className="w-full text-xs bg-gray-50 border border-gray-200 dark:bg-gray-850 dark:border-gray-700 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 outline-hidden focus:border-lime-450"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPanelMode(panelMode === "action" ? "none" : "action")}
                      className="w-full py-4 border-2 border-dashed border-gray-250 hover:border-lime-400 dark:border-gray-750 dark:hover:border-lime-400/80 rounded-xl text-slate-450 dark:text-slate-500 hover:text-lime-500 dark:hover:text-lime-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer bg-slate-50/20"
                    >
                      <IconPlus size={14} />
                      <span>Thêm hành động Automation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cột 2: Select Node Popover Menu (in the center/right side) */}
            {panelMode !== "none" && (
              <div className="w-full lg:w-80 bg-white dark:bg-gray-950 border-t lg:border-t-0 lg:border-l border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-855 dark:text-slate-200 uppercase tracking-wider">
                    {panelMode === "trigger" ? "Chọn sự kiện khởi động" : "Chọn hành động thực hiện"}
                  </h3>
                  <button
                    onClick={() => setPanelMode("none")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {panelMode === "trigger"
                    ? TRIGGER_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectTrigger(opt)}
                          className="w-full p-3 bg-slate-50 hover:bg-lime-50/40 dark:bg-gray-900 dark:hover:bg-lime-950/20 text-left border border-gray-200/60 dark:border-gray-800 rounded-xl transition hover:border-lime-200 dark:hover:border-lime-900 group cursor-pointer"
                        >
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-lime-500 dark:group-hover:text-lime-300 transition">
                            {opt.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                            {opt.desc}
                          </p>
                        </button>
                      ))
                    : ACTION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectAction(opt)}
                          className="w-full p-3 bg-slate-50 hover:bg-lime-50/40 dark:bg-gray-900 dark:hover:bg-lime-950/20 text-left border border-gray-200/60 dark:border-gray-800 rounded-xl transition hover:border-lime-200 dark:hover:border-lime-900 flex gap-3 group cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-lg ${opt.color} text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0`}>
                            {opt.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-lime-500 dark:group-hover:text-lime-300 transition">
                              {opt.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                </div>
              </div>
            )}

            {/* Cột 3: iPhone Mockup Preview */}
            <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-950/40 border-l border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center flex-shrink-0">
              {/* iPhone frame */}
              <div className="relative border-gray-850 dark:border-gray-850 bg-gray-850 border-[8px] rounded-[1.8rem] h-[380px] w-[190px] shadow-md flex-shrink-0">
                {/* Screen inside */}
                <div className="rounded-[1.3rem] overflow-hidden w-full h-full bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div className="h-5 bg-slate-50 dark:bg-slate-900 flex items-center justify-between px-3 text-[6px] text-slate-400 font-sans border-b border-gray-100 dark:border-gray-800/30">
                    <span>9:41</span>
                    <span className="font-bold">5G</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    {renderPhonePreview()}
                  </div>
                  <div className="h-2 bg-white dark:bg-slate-900 flex items-center justify-center">
                    <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Diagram / Chart Workspace */
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-50/50 dark:bg-[#0c0d12]">
            <div className="flex flex-col items-center space-y-6">
              {/* Start block */}
              <div className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-700">
                START / SỰ KIỆN KHỞI CHẠY
              </div>

              {/* Arrow */}
              <svg className="w-5 h-8 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>

              {/* Trigger node */}
              <div className={`w-80 p-5 rounded-2xl border text-center shadow-xs ${
                selectedTrigger
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-dashed"
              }`}>
                <div className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1.5">
                  Sự kiện kích hoạt (Trigger)
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  {selectedTrigger ? selectedTrigger.name : "Chưa chọn Trigger"}
                </h4>
                {selectedTrigger && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {selectedTrigger.desc}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <svg className="w-5 h-8 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>

              {/* Action node */}
              <div className={`w-80 p-5 rounded-2xl border text-center shadow-xs ${
                selectedAction
                  ? "bg-lime-50 dark:bg-lime-950/20 border-lime-100 dark:border-lime-900"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-dashed"
              }`}>
                <div className="text-[9px] font-extrabold text-lime-500 dark:text-lime-400 uppercase tracking-widest mb-1.5">
                  Hành động thực hiện (Action)
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  {selectedAction ? selectedAction.name : "Chưa chọn Hành động"}
                </h4>
                {selectedAction && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {selectedAction.desc}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <svg className="w-5 h-8 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>

              {/* End block */}
              <div className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-700">
                KẾT THÚC LUỒNG (END)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
