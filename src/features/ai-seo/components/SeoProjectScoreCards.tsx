import React from "react";
import { AiSeoScores } from "../types";

interface SeoProjectScoreCardsProps {
  scores?: AiSeoScores & { aiGradeOverall?: number };
  readyForProcessing: boolean;
}

export function SeoProjectScoreCards({
  scores,
  readyForProcessing,
}: SeoProjectScoreCardsProps) {
  // Score color mapping helper
  const getScoreStyle = (score: number | null | undefined) => {
    if (score === null || score === undefined || score === 0 || !readyForProcessing) {
      return {
        text: "text-slate-400",
        bg: "bg-slate-50",
        border: "border-slate-100",
        bgBar: "bg-slate-200",
        val: "—",
      };
    }
    if (score <= 49) {
      return {
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-150",
        bgBar: "bg-rose-500",
        val: `${score}%`,
      };
    }
    if (score <= 79) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-150",
        bgBar: "bg-amber-500",
        val: `${score}%`,
      };
    }
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-150",
      bgBar: "bg-emerald-500",
      val: `${score}%`,
    };
  };

  // Healthy pages computation
  const total = scores?.totalPages || 0;
  const healthy = scores?.healthyPages || 0;
  const hasHealthy = total > 0 && readyForProcessing;
  const healthyPercentage = hasHealthy ? Math.round((healthy / total) * 100) : 0;
  const healthyStyle = getScoreStyle(hasHealthy ? healthyPercentage : null);
  const healthyDisplay = hasHealthy ? `${healthy}/${total}` : "—";

  const grader = scores?.graderScore ?? scores?.aiGradeOverall ?? 0;
  const content = scores?.contentScore ?? 0;
  const authority = scores?.authorityScore ?? 0;
  const technical = scores?.technicalScore ?? 0;
  const ux = scores?.uxScore ?? 0;

  const graderStyle = getScoreStyle(grader);
  const contentStyle = getScoreStyle(content);
  const authorityStyle = getScoreStyle(authority);
  const technicalStyle = getScoreStyle(technical);
  const uxStyle = getScoreStyle(ux);

  const cardList = [
    { label: "Trang tối ưu", style: healthyStyle, displayVal: healthyDisplay, percent: healthyPercentage },
    { label: "Chấm điểm AI", style: graderStyle, displayVal: graderStyle.val, percent: grader },
    { label: "Điểm Nội dung", style: contentStyle, displayVal: contentStyle.val, percent: content },
    { label: "Điểm Uy tín", style: authorityStyle, displayVal: authorityStyle.val, percent: authority },
    { label: "Điểm Kỹ thuật", style: technicalStyle, displayVal: technicalStyle.val, percent: technical },
    { label: "Tín hiệu UX", style: uxStyle, displayVal: uxStyle.val, percent: ux },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 mt-4">
      {cardList.map((card, idx) => (
        <div
          key={idx}
          className={`flex flex-col border rounded-xl p-3.5 transition duration-150 text-center relative overflow-hidden ${card.style.bg} ${card.style.border}`}
        >
          {/* Label */}
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wide uppercase leading-none mb-2">
            {card.label}
          </span>

          {/* Value Display */}
          <span className={`text-base font-black tracking-tight ${card.style.text}`}>
            {card.displayVal}
          </span>

          {/* Micro Progress Bar */}
          {readyForProcessing && card.percent > 0 && (
            <div className="w-full h-1 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${card.style.bgBar}`}
                style={{ width: `${Math.min(card.percent, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export default SeoProjectScoreCards;
