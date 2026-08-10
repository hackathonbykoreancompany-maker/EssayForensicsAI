"use client";

import React, { useEffect, useState } from "react";

export default function AnalysisEmptyStateVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[110px] flex items-center justify-center pointer-events-none mb-1">
      {/* Editorial graphic representation of document scan */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-stone-900 border border-stone-800" />
        <div className="absolute inset-2 rounded-full border border-stone-700/40 border-dashed" />
        
        {/* Document Icon Graphic */}
        <div className="relative z-10 w-11 h-14 rounded bg-stone-850 border border-stone-700 p-2 flex flex-col gap-1.5 shadow-md">
          <div className="w-full h-1 rounded bg-stone-500" />
          <div className="w-3/4 h-1 rounded bg-stone-600" />
          <div className="w-full h-1 rounded bg-stone-600" />
          <div className="w-1/2 h-1 rounded bg-stone-400" />
          <div className="w-4/5 h-1 rounded bg-stone-600" />
        </div>

        {/* Reticle indicator */}
        <div className="absolute -right-0.5 -top-0.5 w-5 h-5 rounded-full bg-stone-900 border border-stone-600 flex items-center justify-center shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        </div>
      </div>
    </div>
  );
}
