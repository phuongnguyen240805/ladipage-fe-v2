"use client";

import React from "react";

interface EditorShellLayoutProps {
  topBar: React.ReactNode;
  leftRail: React.ReactNode;
  leftDrawer: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  aiPanel?: React.ReactNode;
  overlays?: React.ReactNode;
}

export const EditorShellLayout: React.FC<EditorShellLayoutProps> = ({
  topBar,
  leftRail,
  leftDrawer,
  canvas,
  inspector,
  aiPanel,
  overlays,
}) => {
  return (
    <div
      className="landing-editor-shell fixed inset-0 z-[999999] flex flex-col text-gray-800"
      style={{ fontFamily: "Inter, sans-serif", fontSize: 13, backgroundColor: "#f7f7f8" }}
    >
      <style>{`
        .selection-outline,
        .selection-label,
        .toolbar-position-wrapper,
        .canvas-guide,
        .snap-guide {
          pointer-events: none;
        }
        .toolbar-position-wrapper > *,
        [data-editor-toolbar],
        [data-editor-toolbar] button,
        [data-editor-popover],
        [data-editor-popover] button {
          pointer-events: auto;
        }
      `}</style>
      {/* A. Topbar — full width, sticky */}
      <header className="relative z-50 flex-shrink-0">{topBar}</header>

      {/* B. Workspace — gray background, canvas centered independently */}
      <div className="relative min-h-0 flex-1">
        {/* C. Canvas center layer — full workspace, no sibling panels in flow */}
        <main className="absolute inset-0 z-10 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
          {canvas}
        </main>

        {/* D. Floating overlays — fixed/absolute, never push canvas */}
        {leftDrawer}

        <div className="pointer-events-none absolute inset-0 z-30">{leftRail}</div>

        <div className="pointer-events-none absolute inset-0 z-[45]">{inspector}</div>

        {aiPanel}

        {overlays}
      </div>
    </div>
  );
};