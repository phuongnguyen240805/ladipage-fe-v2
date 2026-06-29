import GridShape from "@/features/education/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="text-title-md xl:text-title-2xl mb-8 font-bold text-slate-800 dark:text-white/90 leading-snug">
          ERROR
        </h1>

        <Image
          src="/education/images/error/404.svg"
          alt="404"
          className="dark:hidden"
          width={472}
          height={152}
        />
        <Image
          src="/education/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-slate-700 sm:text-lg dark:text-slate-400 leading-normal leading-relaxed leading-relaxed">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-2 leading-relaxed00"
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-slate-500 dark:text-slate-4 leading-relaxed00 leading-relaxed">
        &copy; {new Date().getFullYear()} - Mona
      </p>
    </div>
  );
}


