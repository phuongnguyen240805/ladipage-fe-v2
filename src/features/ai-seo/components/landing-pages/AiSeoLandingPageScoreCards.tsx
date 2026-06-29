import React from "react";
import { AiSeoProjectPage } from "../../types";

interface AiSeoLandingPageScoreCardsProps {
  pages: AiSeoProjectPage[];
}

export function AiSeoLandingPageScoreCards({ pages }: AiSeoLandingPageScoreCardsProps) {
  const getScoreStyle = (score: number) => {
    if (score === 0) {
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

  // Filter out pages that haven't been scanned (score = 0)
  const scannedPages = pages.filter(p => p.scanStatus === "completed" && p.graderScore > 0);
  const totalScanned = scannedPages.length;

  const avgGrader = totalScanned > 0 ? Math.round(scannedPages.reduce((acc, p) => acc + p.graderScore, 0) / totalScanned) : 0;
  const avgContent = totalScanned > 0 ? Math.round(scannedPages.reduce((acc, p) => acc + p.contentScore, 0) / totalScanned) : 0;
  const avgTechnical = totalScanned > 0 ? Math.round(scannedPages.reduce((acc, p) => acc + p.technicalScore, 0) / totalScanned) : 0;
  const avgUx = totalScanned > 0 ? Math.round(scannedPages.reduce((acc, p) => acc + p.uxScore, 0) / totalScanned) : 0;
  const avgAuthority = totalScanned > 0 ? Math.round(scannedPages.reduce((acc, p) => acc + p.authorityScore, 0) / totalScanned) : 0;

  const healthyPages = scannedPages.filter(p => p.graderScore >= 80).length;
  const totalConnected = pages.length;

  const healthyDisplay = totalConnected > 0 ? `${healthyPages}/${totalConnected}` : "—";
  const healthyPercentage = totalConnected > 0 ? Math.round((healthyPages / totalConnected) * 100) : 0;

  const healthyStyle = getScoreStyle(totalConnected > 0 ? healthyPercentage : 0);
  const graderStyle = getScoreStyle(avgGrader);
  const contentStyle = getScoreStyle(avgContent);
  const technicalStyle = getScoreStyle(avgTechnical);
  const uxStyle = getScoreStyle(avgUx);
  const authorityStyle = getScoreStyle(avgAuthority);

  const cardList = [
    { label: "Trang đạt chuẩn", style: healthyStyle, displayVal: healthyDisplay, percent: healthyPercentage },
    { label: "Chấm điểm TB", style: graderStyle, displayVal: graderStyle.val, percent: avgGrader },
    { label: "Điểm Nội dung TB", style: contentStyle, displayVal: contentStyle.val, percent: avgContent },
    { label: "Điểm Kỹ thuật TB", style: technicalStyle, displayVal: technicalStyle.val, percent: avgTechnical },
    { label: "Tín hiệu UX TB", style: uxStyle, displayVal: uxStyle.val, percent: avgUx },
    { label: "Điểm Uy tín TB", style: authorityStyle, displayVal: authorityStyle.val, percent: avgAuthority },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 mt-4">
      {cardList.map((card, idx) => (
        <div
          key={idx}
          className={`flex flex-col border rounded-xl p-3.5 transition duration-150 text-center relative overflow-hidden ${card.style.bg} ${card.style.border}`}
        >
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wide uppercase leading-none mb-2">
            {card.label}
          </span>
          <span className={`text-base font-black tracking-tight ${card.style.text}`}>
            {card.displayVal}
          </span>
          {card.percent > 0 && (
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
export default AiSeoLandingPageScoreCards;
