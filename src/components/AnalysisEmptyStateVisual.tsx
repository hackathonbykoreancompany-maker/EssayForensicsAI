"use client";

import React, { useEffect, useState } from "react";

export default function AnalysisEmptyStateVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[120px] flex items-center justify-center pointer-events-none mb-1">
      {/* Subtle graphic representation of document scan */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-slate-900/80 border border-slate-800" />
        <div className="absolute inset-2 rounded-full border border-slate-700/40 border-dashed" />
        
        {/* Document Icon Graphic */}
        <div className="relative z-10 w-12 h-15 rounded-lg bg-slate-800 border border-slate-600/60 p-2.5 flex flex-col gap-1.5 shadow-md">
          <div className="w-full h-1 rounded bg-slate-600" />
          <div className="w-3/4 h-1 rounded bg-slate-700" />
          <div className="w-full h-1 rounded bg-slate-700" />
          <div className="w-1/2 h-1 rounded bg-sky-500/80" />
          <div className="w-4/5 h-1 rounded bg-slate-700" />
        </div>

        {/* Reticle indicator */}
        <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-sky-950 border border-sky-600/60 flex items-center justify-center shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
        </div>
      </div>
    </div>
  );
}
