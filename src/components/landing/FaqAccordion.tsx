"use client";

import { useState } from "react";
import { landingData } from "@/data/landing-data";

export function FaqAccordion() {
  const [active, setActive] = useState(0);

  return (
    <div className="divide-y divide-zinc-200 rounded-[28px] border border-zinc-200 bg-white">
      {landingData.faq.map((item, index) => {
        const isOpen = active === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setActive(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7"
            >
              <span className="text-[15px] font-semibold text-zinc-950">{item.question}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-zinc-300 text-[16px] text-zinc-700">
                {isOpen ? "-" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-6 text-[14px] leading-7 text-zinc-600 sm:px-7">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
