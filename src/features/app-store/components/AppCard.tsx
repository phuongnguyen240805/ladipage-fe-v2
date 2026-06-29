import React from "react";
import type { AppItem } from "../types";

interface AppCardProps {
  app: AppItem;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onOpen: (id: string) => void;
  onDetails: (id: string) => void;
}

export default function AppCard({ app, onInstall, onUninstall, onOpen, onDetails }: AppCardProps) {
  // SVG Icon Map
  const renderIcon = (name: string) => {
    switch (name) {
      case "website":
        return (
          <div className="w-12 h-12 text-lime-500 dark:text-lime-300 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
            </svg>
          </div>
        );
      case "store":
        return (
          <div className="w-12 h-12 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75a.75.75 0 00.75.75z" />
            </svg>
          </div>
        );
      case "link":
        return (
          <div className="w-12 h-12 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
        );
      case "blog":
        return (
          <div className="w-12 h-12 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        );
      case "dynamic":
        return (
          <div className="w-12 h-12 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a6 6 0 015.96 5.96zm0 0l-5.84-2.58m5.84 2.58v4.8M9.63 8.41a6 6 0 00-5.84 7.38h4.8m1.04-7.38L3.79 5.83" />
            </svg>
          </div>
        );
      case "elearning":
        return (
          <div className="w-12 h-12 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.43-.22 8.005-.643a60.43 60.43 0 00-.49-6.347m-16.5 0a60.43 60.43 0 0116.5 0m-16.5 0L12 14l8.25-3.853m-16.5 0L12 5.25l8.25 4.897M12 14v6.75M12 5.25L3.75 9.75M12 5.25l8.25 4.5" />
            </svg>
          </div>
        );
      case "affiliate":
        return (
          <div className="w-12 h-12 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
        );
      case "popup":
        return (
          <div className="w-12 h-12 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-6h15M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.25V6.75z" />
            </svg>
          </div>
        );
      case "access":
        return (
          <div className="w-12 h-12 text-lime-500 dark:text-lime-300 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        );
      case "fbads":
        return (
          <div className="w-12 h-12 text-lime-500 dark:text-lime-300 flex items-center justify-center">
            <svg className="w-8 h-8 fill-current text-lime-500 dark:text-lime-300" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case "cloudphone":
        return (
          <div className="w-12 h-12 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <rect x="7" y="2.5" width="10" height="19" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 18.5h3M5 8.5a8.5 8.5 0 0114 0M3 12a11 11 0 0118 0" />
            </svg>
          </div>
        );
      case "offerkit":
        return (
          <div className="w-12 h-12 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5h16M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h3m-3 4h8m-1-7 1 1 2-3" />
            </svg>
          </div>
        );
      case "reports":
        return (
          <div className="w-12 h-12 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        );
      case "seo":
        return (
          <div className="w-12 h-12 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20"/>
            </svg>
          </div>
        );
      case "metrics":
        return (
          <div className="w-12 h-12 text-green-600 dark:text-green-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
          </div>
        );
      case "local":
        return (
          <div className="w-12 h-12 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        );
      case "content":
        return (
          <div className="w-12 h-12 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
        );
      case "keywords":
        return (
          <div className="w-12 h-12 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="7.5" cy="15.5" r="5.5"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 3-9 9"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 3 6 6"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="m18 6-3 3"/>
            </svg>
          </div>
        );
      case "authority":
        return (
          <div className="w-12 h-12 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400 flex items-center justify-center border border-gray-100 dark:border-gray-900/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.34-1.16-1.04-1.16-1.84V9.58c0-.8.48-1.5 1.16-1.84L15.34 5.9c1.03-.52 2.16.24 2.16 1.4v13.4c0 1.16-1.13 1.92-2.16 1.4l-5-2.66z" />
            </svg>
          </div>
        );
    }
  };

  const isInstalled = app.status === "INSTALLED";

  return (
    <div className="bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex flex-col justify-between hover:shadow-theme-md transition-all duration-200 relative group">
      {/* Pin Icon on Top Right */}
      {app.isPinned && (
        <span className="absolute top-4 right-4 text-orange-500 text-sm cursor-help" title="Ứng dụng đã ghim">
          <svg className="w-4 h-4 fill-current rotate-45" viewBox="0 0 20 20">
            <path d="M12.9 2.1c-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3L9.6 3.8 6.4.6C6-.2 4.8-.2 4 .6l-.3.3c-.8.8-.8 2 0 2.8l3.2 3.2-1.7 1.7c-.5-.2-1.1-.1-1.5.3L2 10.6c-.4.4-.4 1.1 0 1.5l1.6 1.6-3 3c-.4.4-.4 1.1 0 1.5.2.2.5.3.8.3s.6-.1.8-.3l3-3 1.6 1.6c.2.2.5.3.8.3.3 0 .6-.1.8-.3l1.8-1.8c.4-.4.5-1 .3-1.5l1.7-1.7 3.2 3.2c.4.4 1 .4 1.4 0l.3-.3c.8-.8.8-2 0-2.8l-3.2-3.2 1.7-1.7c.2.2.5.3.8.3.3 0 .6-.1.8-.3.4-.4.4-1.1 0-1.5z" />
          </svg>
        </span>
      )}

      {/* Top Section */}
      <div>
        <div className="flex items-start gap-4.5 mb-3.5 text-left">
          {renderIcon(app.iconName)}
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
              {app.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                isInstalled 
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-150 dark:border-green-900/30" 
                  : "bg-lime-50 text-lime-600 dark:bg-lime-950/30 dark:text-lime-300 border border-lime-100 dark:border-lime-900/30"
              }`}>
                {isInstalled ? "Đã cài đặt" : app.price}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Description */}
        <p className="text-xs text-gray-400 dark:text-gray-400 text-left line-clamp-3 mb-5 min-h-[54px] leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Bottom Section - Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-1 select-none">
        {/* Left Stats/Tags */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
          {app.downloads ? (
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{app.downloads}</span>
            </div>
          ) : app.tags && app.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {app.tags.map((tag, i) => (
                <span key={i} className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[9px] italic opacity-60">Marketing</span>
          )}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center justify-end gap-1.5 flex-shrink-0 flex-wrap">
          <button 
            type="button"
            onClick={() => onDetails(app.id)}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            Chi tiết
          </button>

          {isInstalled ? (
            <>
              <button
                type="button"
                onClick={() => onOpen(app.id)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Mở app
              </button>
              <button
                type="button"
                onClick={() => onUninstall(app.id)}
                className="px-3 py-1.5 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/35 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Gỡ
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onInstall(app.id)}
              className="px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              + Cài đặt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
