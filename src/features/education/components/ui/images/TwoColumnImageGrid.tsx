import Image from "next/image";
import React from "react";

export default function TwoColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Image
          src="/education/images/grid-image/image-02.png"
          alt=" grid"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
          width={517}
          height={295}
        />
      </div>

      <div>
        <Image
          src="/education/images/grid-image/image-03.png"
          alt=" grid"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
          width={517}
          height={295}
        />
      </div>
    </div>
  );
}
