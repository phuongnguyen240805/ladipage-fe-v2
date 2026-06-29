import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-5 dark:border-white/5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-500">CloudPhone · Live Control</div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        Gateway connected
      </div>
    </div>
  );
}
