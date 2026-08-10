"use client";

import React, { useEffect, useState } from "react";

const STAGES = [
  "Reading document structure...",
  "Analyzing sentence patterns & variance...",
  "Checking linguistic & cadence signals...",
  "Calculating forensic evidence scores...",
  "Generating stylometric report...",
];

export default function ForensicLoadingState() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="surface-card rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-5 min-h-[480px]">
      {/* Subtle Document Scanning Indicator */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer subtle ring */}
        <div className="absolute inset-0 rounded-full border border-stone-700/60 animate-spin [animation-duration:8s]" />
        <div className="absolute inset-2 rounded-full border border-stone-800 border-dashed" />
        
        {/* Document Icon with Scanning bar */}
        <div className="relative z-10 w-11 h-14 rounded bg-stone-900 border border-stone-700 p-2 flex flex-col gap-1.5 shadow-md overflow-hidden">
          <div className="w-full h-1 rounded bg-stone-600" />
          <div className="w-3/4 h-1 rounded bg-stone-700" />
          <div className="w-full h-1 rounded bg-stone-700" />
          <div className="w-1/2 h-1 rounded bg-stone-500" />
          <div className="w-4/5 h-1 rounded bg-stone-700" />
          
          {/* Scanning line animation */}
          <div className="absolute inset-x-0 h-1 bg-stone-200/80 blur-[0.5px] animate-bounce [animation-duration:1.5s]" />
        </div>

        {/* Orbiting dot */}
        <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-stone-300 shadow-sm animate-pulse" />
      </div>

      <div className="space-y-2 max-w-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-stone-400 animate-ping" />
          <h3 className="text-sm font-semibold text-stone-100 tracking-tight font-mono">
            ANK &times; EssayForensics AI
          </h3>
        </div>
        
        <p className="text-xs text-stone-300 font-medium h-5 transition-all duration-200">
          {STAGES[stageIndex]}
        </p>

        <p className="text-[11px] text-stone-500 pt-1">
          Evaluating 6 statistical stylometry metrics against calibrated corpus
        </p>
      </div>

      {/* Progress step dots */}
      <div className="flex items-center gap-1.5 pt-2">
        {STAGES.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === stageIndex ? "bg-stone-200 w-4" : "bg-stone-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
