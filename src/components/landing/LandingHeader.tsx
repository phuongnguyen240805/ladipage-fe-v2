"use client";

import { useState } from "react";
import { landingData } from "@/data/landing-data";

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const { product, nav } = landingData;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3 font-semibold text-zinc-950">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-zinc-950 text-[13px] font-black text-white">LS</span>
          <span className="text-[15px] tracking-normal">{product.name}</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-[13px] font-medium text-zinc-600 transition hover:text-zinc-950">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#pricing"
            className="rounded-full border border-zinc-300 px-4 py-2 text-[13px] font-semibold text-zinc-800 transition hover:border-zinc-950"
          >
            Xem giá
          </a>
          <a
            href="#final-cta"
            className="rounded-full bg-zinc-950 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-zinc-800 active:translate-y-px"
          >
            {product.primaryCta}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-950 lg:hidden"
          aria-label="Mở menu"
          aria-expanded={open}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#final-cta"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-zinc-950 px-4 py-3 text-center text-[13px] font-semibold text-white"
            >
              {product.primaryCta}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
