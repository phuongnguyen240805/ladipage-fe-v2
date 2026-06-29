import React from "react";
import { useAiSeoProjectMutations } from "../hooks/useAiSeoProjectMutations";
import { Loader2 } from "lucide-react";

interface SeoProjectAgentToggleProps {
  projectId: string;
  agentStatus: "engaged" | "disengaged";
}

export function SeoProjectAgentToggle({
  projectId,
  agentStatus,
}: SeoProjectAgentToggleProps) {
  const { agentToggleMutation } = useAiSeoProjectMutations();
  const isEngaged = agentStatus === "engaged";

  // Check if this specific project is currently toggling
  const isLoading =
    agentToggleMutation.isPending &&
    agentToggleMutation.variables === projectId;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    agentToggleMutation.mutate(projectId);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
        AI AGENT:
      </span>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-5 w-[84px] shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-250 ease-in-out focus:outline-none items-center ${
          isEngaged ? "bg-violet-600" : "bg-amber-500"
        }`}
      >
        <span
          className={`pointer-events-none inline-flex h-4 w-10 transform rounded-full bg-white shadow-sm transition-transform duration-250 ease-in-out items-center justify-center text-[8px] font-black tracking-tighter ${
            isEngaged
              ? "translate-x-[41px] text-violet-700"
              : "translate-x-0.5 text-amber-700"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-2 h-2 animate-spin text-slate-500" />
          ) : isEngaged ? (
            "ENGAGED"
          ) : (
            "OFF"
          )}
        </span>
      </button>
    </div>
  );
}
export default SeoProjectAgentToggle;
