import React from "react";

export function SeoProjectSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse space-y-6"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-slate-200 rounded"></div>
                <div className="w-20 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
              <div className="w-20 h-6 bg-slate-200 rounded-lg"></div>
            </div>
          </div>

          {/* Warning Banner Skeleton */}
          <div className="w-full h-8 bg-slate-100 rounded-lg"></div>

          {/* Score Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div
                key={k}
                className="bg-slate-50 border border-slate-100/50 rounded-xl p-3 text-center space-y-2"
              >
                <div className="w-16 h-3 bg-slate-200 rounded mx-auto"></div>
                <div className="w-10 h-6 bg-slate-350 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default SeoProjectSkeleton;
