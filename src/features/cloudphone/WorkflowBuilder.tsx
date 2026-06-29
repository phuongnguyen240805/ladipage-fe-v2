"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

// --- Inline SVG Icons equivalent to Tabler Icons ---
function IconArrowBack(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconRoute(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M12 19h4.5a2.5 2.5 0 0 0 2.5 -2.5v-7" />
      <path d="M6 17v-7.5a2.5 2.5 0 0 1 2.5 -2.5H12" />
    </svg>
  );
}

function IconDeviceFloppy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h10l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="14" r="3" />
      <polyline points="9 17 9 12 15 12 15 17" />
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

function IconDeviceMobile(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <line x1="11" y1="4" x2="13" y2="4" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

function IconReload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  );
}

function IconClick(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="7.8" y1="7.8" x2="5.6" y2="5.6" />
      <line x1="16.2" y1="7.8" x2="18.4" y2="5.6" />
      <line x1="7.8" y1="16.2" x2="5.6" y2="18.4" />
      <path d="M12 12l9 3l-4 2l-2 4z" />
    </svg>
  );
}

function IconGripVertical(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
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

const nodePalette = [
  { type: "resource", label: "Resource Status", group: "General", color: "bg-sky-400 border-sky-500 shadow-sky-500/20", icon: IconDeviceMobile },
  { type: "delay", label: "Delay Action", group: "General", color: "bg-slate-400 border-slate-500 shadow-slate-500/20", icon: IconReload },
  { type: "request", label: "HTTP Request", group: "General", color: "bg-indigo-400 border-indigo-500 shadow-indigo-500/20", icon: IconRoute },
  { type: "touch", label: "Touch Element", group: "UI Interaction", color: "bg-teal-400 border-teal-500 shadow-teal-500/20", icon: IconClick },
  { type: "swipe", label: "Swipe / Scroll", group: "UI Interaction", color: "bg-orange-400 border-orange-500 shadow-orange-500/20", icon: IconGripVertical },
  { type: "search", label: "Image Search", group: "UI Interaction", color: "bg-purple-400 border-purple-500 shadow-purple-500/20", icon: IconSearch },
  { type: "text", label: "Type Text", group: "UI Interaction", color: "bg-cyan-400 border-cyan-500 shadow-cyan-500/20", icon: IconEye },
];

interface CanvasNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  color: string;
  tone: "start" | "end" | "action";
  parameters?: Record<string, any>;
}

interface CanvasEdge {
  fromId: string;
  toId: string;
}

const initialNodes: CanvasNode[] = [
  { id: "start", type: "start", label: "Start", x: 60, y: 150, color: "bg-emerald-500 border-emerald-600 shadow-emerald-500/20", tone: "start" },
  { id: "delay-1", type: "delay", label: "Delay Action", x: 240, y: 150, color: "bg-slate-400 border-slate-500 shadow-slate-500/20", tone: "action", parameters: { delayMs: 3000 } },
  { id: "touch-1", type: "touch", label: "Touch Element", x: 440, y: 150, color: "bg-teal-400 border-teal-500 shadow-teal-500/20", tone: "action", parameters: { xpath: "//android.widget.Button[@text='Login']" } },
  { id: "end", type: "end", label: "End", x: 640, y: 150, color: "bg-rose-500 border-rose-600 shadow-rose-500/20", tone: "end" },
];

const initialEdges: CanvasEdge[] = [
  { fromId: "start", toId: "delay-1" },
  { fromId: "delay-1", toId: "touch-1" },
  { fromId: "touch-1", toId: "end" },
];

export default function WorkflowBuilder() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;

  const [tab, setTab] = useState<"workflow" | "inspector">("workflow");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);
  
  // Grid / Connection states
  const [isSnappingEnabled, setIsSnappingEnabled] = useState(true);
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
  const [connectingSource, setConnectingSource] = useState<string | null>(null);

  // Simulation run state
  const [simulationActive, setSimulationActive] = useState(false);
  const [simNodeActive, setSimNodeActive] = useState<string | null>(null);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [showLogWindow, setShowLogWindow] = useState(false);

  // Dragging node on canvas
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const title = workflowId
    ? workflowId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Kịch bản Mới";

  // Drag and drop node placement logic
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Click outside node deselects
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
      setSelectedNode(null);
      setConnectingSource(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNode(node);
    setDraggingNodeId(nodeId);

    // Calculate mouse position relative to node top-left
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const nodeX = node.x;
      const nodeY = node.y;
      const mouseXInCanvas = e.clientX - rect.left;
      const mouseYInCanvas = e.clientY - rect.top;
      setDragOffset({
        x: mouseXInCanvas - nodeX,
        y: mouseYInCanvas - nodeY,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffset.x;
    const rawY = e.clientY - rect.top - dragOffset.y;

    // Apply snap to grid
    const x = isSnappingEnabled ? Math.round(rawX / 20) * 20 : rawX;
    const y = isSnappingEnabled ? Math.round(rawY / 20) * 20 : rawY;

    // Boundary limits
    const finalX = Math.max(10, Math.min(rect.width - 160, x));
    const finalY = Math.max(10, Math.min(rect.height - 70, y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: finalX, y: finalY } : n))
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Connection flow
  const handleConnectorClick = (e: React.MouseEvent, nodeId: string, type: "source" | "target") => {
    e.stopPropagation();
    if (type === "source") {
      setConnectingSource(nodeId);
      addSimLog(`Bắt đầu kết nối từ khối: ${nodes.find((n) => n.id === nodeId)?.label}`);
    } else {
      if (connectingSource && connectingSource !== nodeId) {
        // Prevent duplicate edges
        const exists = edges.some(
          (edge) => edge.fromId === connectingSource && edge.toId === nodeId
        );
        if (!exists) {
          setEdges((prev) => [...prev, { fromId: connectingSource, toId: nodeId }]);
          addSimLog(
            `Đã kết nối ${nodes.find((n) => n.id === connectingSource)?.label} -> ${
              nodes.find((n) => n.id === nodeId)?.label
            }`
          );
        }
      }
      setConnectingSource(null);
    }
  };

  // Add new node from palette
  const addNewNode = (paletteItem: typeof nodePalette[number]) => {
    const id = `${paletteItem.type}-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: paletteItem.type,
      label: paletteItem.label,
      x: 150 + Math.random() * 80,
      y: 150 + Math.random() * 80,
      color: paletteItem.color,
      tone: "action",
      parameters: paletteItem.type === "delay" ? { delayMs: 2000 } : { xpath: "" },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
    addSimLog(`Đã thêm khối mới: ${paletteItem.label}`);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === "start" || nodeId === "end") return; // Prevent deleting Start/End
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((edge) => edge.fromId !== nodeId && edge.toId !== nodeId));
    setSelectedNode(null);
    addSimLog(`Đã xóa khối: ${nodeId}`);
  };

  const addSimLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSimLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  // Automated execution simulator
  const runWorkflow = () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setShowLogWindow(true);
    setSimLogs([]);
    addSimLog("Khởi chạy tiến trình giả lập workflow tự động hóa...");

    // Basic sequential node highlighting
    const sequence = ["start", "delay-1", "touch-1", "end"];
    let step = 0;

    const runStep = () => {
      if (step >= sequence.length) {
        setSimNodeActive(null);
        setSimulationActive(false);
        addSimLog("Hoàn thành giả lập kịch bản thành công! 100% Khớp.");
        return;
      }

      const activeId = sequence[step];
      const node = nodes.find((n) => n.id === activeId);

      if (node) {
        setSimNodeActive(activeId);
        addSimLog(`Khối kích hoạt: "${node.label}"...`);
        if (node.type === "delay") {
          addSimLog(`Đang đợi: ${node.parameters?.delayMs || 3000}ms...`);
        } else if (node.type === "touch") {
          addSimLog(`Tương tác Click XPath: "${node.parameters?.xpath || ""}"`);
        }
      }

      step++;
      setTimeout(runStep, 2000);
    };

    runStep();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)] bg-[#f8fafc] dark:bg-[#0c0d14] select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#11121b] border-b border-gray-150 dark:border-gray-800 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/cloudphone/workflow-manager")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-500 cursor-pointer"
          >
            <IconArrowBack className="h-4.5 w-4.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-800 dark:text-white capitalize">{title}</h1>
              <IconRoute className="h-4 w-4 text-slate-400" />
              <span className="rounded bg-sky-100 dark:bg-sky-950/30 text-sky-500 px-2 py-0.5 text-[10px] font-black uppercase">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none mt-1">
              Trình thiết kế luồng tự động hóa bằng đồ họa (Visual Automation Canvas)
            </p>
          </div>
        </div>

        {/* Dropdown Device Select & Save/Run buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none min-w-[200px]"
          >
            <option value="">-- Chọn điện thoại liên kết --</option>
            <option value="dv-001">Samsung Galaxy Note 8 - VN (SM-N950)</option>
            <option value="dv-002">Samsung Galaxy S7 - Game (SM-G930)</option>
            <option value="dv-003">Cloud Emulator 8C (CLD-8C-09)</option>
          </select>

          <button
            onClick={() => alert("Đã lưu cấu hình luồng kịch bản!")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:hover:bg-slate-800 hover:bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 transition cursor-pointer active:scale-95"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            <span>Lưu lại</span>
          </button>
          <button
            onClick={runWorkflow}
            disabled={simulationActive}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow transition cursor-pointer active:scale-95 ${
              simulationActive
                ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            <IconPlayerPlay className="h-4 w-4" />
            <span>Chạy thử</span>
          </button>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="bg-white dark:bg-[#11121b] border-b border-gray-150 dark:border-gray-800 px-4 py-0 flex shrink-0">
        <button
          onClick={() => setTab("workflow")}
          className={`px-4 py-2 text-xs font-black transition-all border-b-2 cursor-pointer ${
            tab === "workflow"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white"
          }`}
        >
          Trình vẽ Workflow (Canvas)
        </button>
        <button
          onClick={() => setTab("inspector")}
          className={`px-4 py-2 text-xs font-black transition-all border-b-2 cursor-pointer ${
            tab === "inspector"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white"
          }`}
        >
          Trình Thanh tra XPath (Inspector)
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {tab === "workflow" ? (
          /* WORKFLOW BUILDER TAB */
          <div className="flex-1 flex min-h-0 divide-x divide-gray-150 dark:divide-gray-800">
            {/* Palette Panel */}
            <div className="w-60 bg-white dark:bg-[#11121b] flex flex-col p-4 space-y-5 overflow-y-auto shrink-0 select-none">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Khối chức năng</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Nhấp vào một khối để đưa vào màn hình chỉnh sửa canvas.
                </p>
              </div>

              {/* Group General */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Cơ bản (General)</h4>
                <div className="space-y-1.5">
                  {nodePalette
                    .filter((item) => item.group === "General")
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          onClick={() => addNewNode(item)}
                          className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 p-2.5 text-left text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-500 transition cursor-pointer group"
                        >
                          <Icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group UI Interaction */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Tương tác UI</h4>
                <div className="space-y-1.5">
                  {nodePalette
                    .filter((item) => item.group === "UI Interaction")
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          onClick={() => addNewNode(item)}
                          className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 p-2.5 text-left text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-500 transition cursor-pointer group"
                        >
                          <Icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="flex-1 flex flex-col relative min-w-0 bg-slate-100/35 dark:bg-[#090a0f]">
              {/* Canvas controls banner overlay */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-[#11121b]/95 backdrop-blur-xs border border-gray-150 dark:border-gray-850 px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-3">
                <button
                  onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition ${
                    isSnappingEnabled ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  }`}
                >
                  Snap to grid: {isSnappingEnabled ? "Bật" : "Tắt"}
                </button>
                <button
                  onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition ${
                    isBackgroundEnabled ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  }`}
                >
                  Lưới nền: {isBackgroundEnabled ? "Hiện" : "Ẩn"}
                </button>
                <button
                  onClick={() => setShowLogWindow(!showLogWindow)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-[10px] font-extrabold cursor-pointer transition"
                >
                  {showLogWindow ? "Ẩn Nhật ký" : "Hiện Nhật ký"}
                </button>
              </div>

              {/* Connecting prompt banner overlay */}
              {connectingSource && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-indigo-600 text-white text-[11px] font-extrabold px-4.5 py-2 rounded-full shadow-md animate-pulse">
                  Nhấn vào cổng Input (TRÁI) của khối khác để tạo kết nối...
                </div>
              )}

              {/* Interactive SVG Canvas pane */}
              <div
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="flex-1 w-full h-full relative overflow-hidden"
                style={{
                  backgroundImage: isBackgroundEnabled
                    ? `radial-gradient(circle, ${
                        isDark ? "#272a37" : "#e2e8f0"
                      } 1.5px, transparent 1.5px)`
                    : "none",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* SVG Connections drawing layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {edges.map((edge, idx) => {
                    const fromNode = nodes.find((n) => n.id === edge.fromId);
                    const toNode = nodes.find((n) => n.id === edge.toId);
                    if (!fromNode || !toNode) return null;

                    // Calculate curve start (source right handle) and end (target left handle)
                    const x1 = fromNode.x + 160;
                    const y1 = fromNode.y + 25;
                    const x2 = toNode.x;
                    const y2 = toNode.y + 25;

                    // Smooth Bezier path calculation
                    const controlX = x1 + (x2 - x1) / 2;
                    const pathD = `M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`;

                    const isSimulatedActive =
                      simNodeActive === edge.fromId && simulationActive;

                    return (
                      <g key={`${edge.fromId}-${edge.toId}-${idx}`}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isSimulatedActive ? "#f59e0b" : "#6366f1"}
                          strokeWidth={isSimulatedActive ? "3.5" : "2.2"}
                          strokeDasharray={isSimulatedActive ? "6, 4" : "none"}
                          className={isSimulatedActive ? "animate-[dash_1s_linear_infinite]" : ""}
                          opacity="0.8"
                        />
                        <circle cx={x1} cy={y1} r="3" fill="#6366f1" />
                        <circle cx={x2} cy={y2} r="3" fill="#6366f1" />
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes rendering layer */}
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isActiveSim = simNodeActive === node.id && simulationActive;
                  
                  // Tone borders and outline sizing
                  const borderOutline = isSelected
                    ? "ring-2 ring-amber-500 scale-[1.02]"
                    : isActiveSim
                      ? "ring-4 ring-amber-500 animate-pulse border-amber-500"
                      : "border-gray-250 dark:border-gray-700/80";

                  const isStartOrEnd = node.tone === "start" || node.tone === "end";

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                      className={`absolute w-40 min-h-[50px] rounded-xl border bg-white dark:bg-[#11121b] px-3.5 py-2.5 shadow-sm transition active:scale-98 select-none flex flex-col justify-center cursor-grab ${borderOutline} z-10`}
                    >
                      {/* Left Handle Input */}
                      {!isStartOrEnd && node.tone !== "start" && (
                        <div
                          onClick={(e) => handleConnectorClick(e, node.id, "target")}
                          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800 border-2 border-white dark:border-slate-950 hover:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer z-20"
                          title="Input Connection"
                        />
                      )}

                      {/* Content Info */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${node.color}`} />
                          <span className="font-extrabold text-[11px] text-slate-800 dark:text-white truncate">
                            {node.label}
                          </span>
                        </div>
                        
                        {/* Quick Trash delete */}
                        {!isStartOrEnd && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Display specs inside action nodes */}
                      {node.type === "delay" && (
                        <div className="text-[9px] font-semibold text-slate-400 mt-1 leading-none">
                          Đợi: {node.parameters?.delayMs || 2000} ms
                        </div>
                      )}
                      {node.type === "touch" && (
                        <div className="text-[9px] font-mono text-slate-450 dark:text-slate-500 mt-1 leading-none truncate" title={node.parameters?.xpath}>
                          XPath: {node.parameters?.xpath ? "Custom" : "--"}
                        </div>
                      )}

                      {/* Right Handle Output */}
                      {!isStartOrEnd && node.tone !== "end" && (
                        <div
                          onClick={(e) => handleConnectorClick(e, node.id, "source")}
                          className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800 border-2 border-white dark:border-slate-950 hover:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer z-20"
                          title="Output Connection"
                        />
                      )}
                      
                      {node.id === "start" && (
                        <div
                          onClick={(e) => handleConnectorClick(e, node.id, "source")}
                          className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 hover:bg-emerald-600 cursor-pointer z-20"
                        />
                      )}
                      {node.id === "end" && (
                        <div
                          onClick={(e) => handleConnectorClick(e, node.id, "target")}
                          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950 hover:bg-rose-600 cursor-pointer z-20"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Simulated logs overlay pane */}
              {showLogWindow && (
                <div className="absolute bottom-4 left-4 right-4 h-48 bg-slate-950/95 dark:bg-black/95 text-lime-400 font-mono text-xs rounded-2xl border border-slate-800 p-4 shadow-xl z-20 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0 text-slate-400">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-300">
                      Nhật ký chạy thử tự động hóa (Execution Console Log)
                    </span>
                    <button
                      onClick={() => setShowLogWindow(false)}
                      className="text-slate-400 hover:text-white text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1 text-[11px] font-medium leading-normal scrollbar-thin scrollbar-thumb-slate-800">
                    {simLogs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                    {simLogs.length === 0 && (
                      <div className="text-slate-600">Console sẵn sàng. Hãy bấm "Chạy thử" để kích hoạt...</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Config Panel */}
            <div className="w-80 bg-white dark:bg-[#11121b] p-4 flex flex-col overflow-y-auto shrink-0 select-none space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Cấu hình tham số</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Chọn một khối trên màn hình canvas để tùy chỉnh thông số chi tiết kịch bản.
                </p>
              </div>

              {selectedNode ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-gray-150 dark:border-gray-850">
                    <div className="text-[10px] font-black uppercase text-slate-400">Tên khối</div>
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs mt-0.5">{selectedNode.label}</div>
                    <div className="text-[9px] font-mono text-slate-450 dark:text-slate-500 mt-1 leading-none">ID: {selectedNode.id}</div>
                  </div>

                  {/* Delay fields */}
                  {selectedNode.type === "delay" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500">
                        Thời gian trễ (milliseconds)
                      </label>
                      <input
                        type="number"
                        value={selectedNode.parameters?.delayMs ?? 2000}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, parameters: { ...n.parameters, delayMs: val } }
                                : n
                            )
                          );
                          setSelectedNode((prev) => (prev ? { ...prev, parameters: { ...prev.parameters, delayMs: val } } : null));
                        }}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                        min="50"
                        max="60000"
                      />
                    </div>
                  )}

                  {/* Touch fields */}
                  {selectedNode.type === "touch" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500">
                        Biểu thức tìm XPath phần tử
                      </label>
                      <textarea
                        value={selectedNode.parameters?.xpath ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, parameters: { ...n.parameters, xpath: val } }
                                : n
                            )
                          );
                          setSelectedNode((prev) => (prev ? { ...prev, parameters: { ...prev.parameters, xpath: val } } : null));
                        }}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                        placeholder="//android.widget.TextView[@resource-id='com.android...']"
                      />
                    </div>
                  )}

                  {/* General actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      disabled={selectedNode.id === "start" || selectedNode.id === "end"}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 dark:border-rose-950/30 dark:hover:bg-rose-950/20 text-rose-600 font-extrabold text-xs py-2.5 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <IconTrash className="h-4 w-4" />
                      Xóa khối này
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 px-4">
                    Nhấn chọn bất kỳ khối nào trên lưới để cấu hình.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* INSPECTOR VIEW TAB */
          <div className="flex-1 flex min-h-0 divide-x divide-gray-150 dark:divide-gray-800">
            {/* Device Inspector panel */}
            <div className="w-80 bg-white dark:bg-[#11121b] p-4 flex flex-col overflow-y-auto shrink-0 select-none space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Thiết bị phân tích</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Chụp màn hình và xuất cấu trúc cây giao diện XML điện thoại để lấy XPath chính xác.
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 transition cursor-pointer active:scale-95">
                  Chọn điểm
                </button>
                <button className="rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-xs font-bold text-slate-650 hover:bg-slate-150 transition cursor-pointer">
                  Làm mới
                </button>
                <button className="rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-xs font-bold text-slate-650 hover:bg-slate-150 transition cursor-pointer">
                  Cắt ảnh
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Class Name</label>
                <input
                  type="text"
                  readOnly
                  value="android.widget.Button"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Resource ID</label>
                <input
                  type="text"
                  readOnly
                  value="com.tiktok.android:id/login_button"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-gray-800 text-center">
                <p className="text-[11px] font-bold text-slate-500">Chưa tải dữ liệu XML trực tiếp</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
                  Chụp màn hình thiết bị đang trực tuyến để trích xuất node UI.
                </p>
              </div>
            </div>

            {/* Device screen Preview mockup panel */}
            <div className="flex-1 bg-slate-100/35 dark:bg-[#090a0f] flex items-center justify-center p-6 min-w-0 select-none overflow-y-auto">
              <div className="relative w-64 aspect-[9/18.5] rounded-[2rem] border-[6px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden shrink-0">
                {/* Speaker & Front Camera notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                  <span className="h-1 w-1 bg-slate-900 border border-slate-700/60 rounded-full ml-auto mr-1.5" />
                </div>
                {/* Mock Phone screen */}
                <div className="absolute inset-1.5 bg-slate-900 rounded-[1.7rem] overflow-hidden flex flex-col justify-between p-2">
                  <div className="h-4 text-[7px] font-black text-slate-450 flex items-center justify-between px-1">
                    <span>14:32</span>
                    <span>100% 🔋</span>
                  </div>
                  {/* Inside apps mockup content */}
                  <div className="flex-1 flex flex-col bg-slate-950 items-center justify-center text-center p-3">
                    <IconDeviceMobile className="h-10 w-10 text-slate-650 animate-bounce" />
                    <h4 className="text-white text-[10px] font-extrabold mt-2">Trình xem thiết bị</h4>
                    <p className="text-[8px] text-slate-500 mt-1 leading-normal">
                      Hãy chọn một điện thoại trực tuyến để tải giao diện live view.
                    </p>
                  </div>
                  <div className="h-4 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-slate-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Element Details & Xpath panel */}
            <div className="w-80 bg-white dark:bg-[#11121b] p-4 flex flex-col overflow-y-auto shrink-0 select-none space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Chi tiết phần tử XML</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Bảng danh sách các thuộc tính phần tử Node UI đang được chọn trên mockup.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">XPath Đề xuất</label>
                <textarea
                  readOnly
                  rows={3}
                  value="//android.widget.Button[@resource-id='com.tiktok.android:id/login_button' and @text='Đăng nhập']"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-350 outline-none resize-none"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase">Danh sách thuộc tính (Properties)</h4>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[10px] font-semibold text-slate-650">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">text</span>
                    <span className="text-slate-800 dark:text-slate-200">Đăng nhập</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">clickable</span>
                    <span className="text-emerald-500">true</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">enabled</span>
                    <span className="text-emerald-500">true</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">checked</span>
                    <span className="text-slate-800 dark:text-slate-200">false</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">bounds</span>
                    <span className="text-slate-800 dark:text-slate-200">[48, 1280][1032, 1424]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
