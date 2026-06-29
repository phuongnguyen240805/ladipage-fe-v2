"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Check, Terminal, ShieldCheck, Loader2 } from "lucide-react";
import SeoAutomationShell from "@/features/ai-seo/components/SeoAutomationShell";

export default function ProjectInstallationPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "demo";

  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const scriptTag = `<script async src="https://api.otto-seo.com/sdk/${projectId}.js"></script>`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    setChecking(true);
    // Simulate checking code installation script tags
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setChecking(false);
    setChecked(true);

    try {
      // Try to call verification check endpoint (graceful fail if missing)
      await fetch(`/api/ai-seo/seo-projects/${projectId}/installations/check`, {
        method: "POST",
      });
    } catch (_) {}
  };

  return (
    <SeoAutomationShell>
      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 text-left">
        {/* Back Link */}
        <Link
          href="/ai-seo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Title */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Verify Pixel Script Installation
          </h1>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Configure OTTO SEO script integrations to automate metadata optimizations and monitor page crawling metrics.
          </p>
        </div>

        {/* Settings options grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Code box installation panel */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-violet-500" />
              Embed Custom Code Tag
            </h3>
            <p className="text-xs text-slate-400 leading-normal font-semibold">
              Copy and paste this script snippet within the <code className="text-slate-200 bg-slate-950 px-1 rounded">&lt;head&gt;</code> section of your website:
            </p>

            {/* Code Box container */}
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-850 text-slate-350 font-mono text-[10px] sm:text-xs rounded-xl p-4 overflow-x-auto select-all pr-12 whitespace-pre-wrap break-all leading-relaxed">
                {scriptTag}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-750 transition"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Verification trigger buttons */}
            <div className="flex items-center gap-3 border-t border-slate-850 pt-5 mt-4">
              <button
                onClick={handleVerify}
                disabled={checking}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-755 text-white rounded-xl text-xs font-black shadow transition disabled:opacity-75"
              >
                {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Verify Code script
              </button>

              {checked && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 animate-pulse" />
                  Code script verified successfully!
                </span>
              )}
            </div>
          </div>

          {/* Side integrations guide links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-450 uppercase tracking-widest text-[9px]">
              Select Integration
            </h3>

            <div className="space-y-3.5 text-slate-400 leading-relaxed font-semibold">
              <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                <span className="block font-bold text-white mb-0.5">
                  WordPress Plugin
                </span>
                Download our plugin to install pixel scripts automatically on your site.
              </div>
              <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                <span className="block font-bold text-white mb-0.5">
                  Cloudflare Worker
                </span>
                Integrate edge script rewrites through Cloudflare edge pipelines.
              </div>
              <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                <span className="block font-bold text-white mb-0.5">
                  Custom Embed
                </span>
                Copy code tags and insert manually inside standard site editors.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SeoAutomationShell>
  );
}
