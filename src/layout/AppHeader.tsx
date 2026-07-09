"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { usePlatformAuth } from "@/features/auth/hooks/usePlatformAuth";
import {
  resolveAccountDisplayName,
  resolveAccountInitial,
} from "@/lib/profile-meta";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { profile, isLoading } = usePlatformAuth();

  const displayName = isLoading
    ? "..."
    : resolveAccountDisplayName(profile);
  const avatarSrc = profile?.avatar || "/images/user/owner.jpg";
  const avatarInitial = resolveAccountInitial(profile);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 h-[46px] items-center">
      <div className="flex items-center justify-between w-full px-4 lg:px-6">
        {/* Left Side: Sidebar Toggle, Mobile Logo, Dropdowns */}
        <div className="flex items-center gap-2 h-7">
          <button
            className="flex lg:hidden items-center justify-center w-7 h-7 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 cursor-pointer"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="14"
                height="10"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Profile Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 h-7 text-gray-700 dark:text-gray-300 text-[13px] font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition select-none">
            {profile?.avatar?.trim() ? (
              <span className="flex h-4.5 w-4.5 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                <Image width={18} height={18} src={avatarSrc} alt={displayName} />
              </span>
            ) : (
              <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-lime-50 dark:bg-lime-900/50 text-lime-600 dark:text-lime-300 text-[10px] font-bold">
                {avatarInitial}
              </span>
            )}
            <span className="max-w-[140px] truncate">{displayName}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
            </svg>
          </div>

          {/* Team Selector (Tất cả Team) */}
          <div className="hidden md:flex items-center gap-1.5 px-2 h-7 text-gray-700 dark:text-gray-300 text-[13px] font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition select-none">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
            </svg>
            <span>Tất cả Team</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
            </svg>
          </div>
        </div>

        {/* Center Side: Search Bar */}
        <div className="hidden lg:block max-w-sm w-full mx-auto px-4">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative h-7 flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="currentColor" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm"
                className="h-7 w-full rounded-lg border border-gray-200 bg-gray-50/50 py-0 pl-9 pr-10 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-lime-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-lime-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-lime-800"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] text-gray-400 dark:border-gray-700 dark:bg-gray-800 leading-none">
                <span>⌘</span>
                <span>K</span>
              </span>
            </div>
          </form>
        </div>

        {/* Right Side: Action Buttons, Help, Notification, Theme Toggle, User */}
        <div className="flex items-center gap-3 h-7">
          <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-800 pl-3 h-7">
            {/* Help / Question Icon */}
            <button className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer transition">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"></path>
              </svg>
            </button>

            {/* LadiPoints Widget */}
            <div className="hidden md:flex items-center gap-1 px-2 h-7 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition select-none">
              <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-2 0v1h2zm3 0H9v1h3a1 1 0 100-2z" clipRule="evenodd" />
                <path d="M9 12H4v5a2 2 0 002 2h3v-7zm2 7h3a2 2 0 002-2v-5h-5v7z" />
              </svg>
              <span>250</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggleButton />

            {/* Notification Dropdown */}
            <NotificationDropdown />
          </div>

          {/* User Dropdown */}
          <div className="border-l border-gray-200 dark:border-gray-800 pl-3 h-7 flex items-center">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
