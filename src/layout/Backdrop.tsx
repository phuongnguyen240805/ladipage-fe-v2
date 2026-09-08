import { useSidebar } from "@/context/SidebarContext";
import React from "react";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="ladi-backdrop-enter fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
