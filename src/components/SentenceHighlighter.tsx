"use client";

import React from "react";
import type { EssayAnalysisResult, SentenceResult } from "../services/essayAnalysisService";

interface SentenceHighlighterProps {
  result: EssayAnalysisResult;
  selectedIndex: number | null;
  onSelectSentence: (index: number) => void;
}

export default function SentenceHighlighter({
  result,
  selectedIndex,
  onSelectSentence,
}: SentenceHighlighterProps) {
  const { sentences } = result;

  if (!sentences || sentences.length === 0) {
    return null;
  }

  return (
    <div className="surface-card rounded-2xl p-5 space-y-3.5">
      {/* Header with compact forensic legend */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Passage Stylometry Map
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click any sentence to inspect specific evidence indicators
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-300">AI-like</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-300">Uncertain</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Human</span>
          </span>
        </div>
      </div>

      {/* Essay text with inline sentence highlighting */}
      <div className="text-[13px] sm:text-[14px] leading-[1.8] text-slate-200 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 max-h-[360px] overflow-y-auto">
        {sentences.map((s: SentenceResult, i: number) => {
          const isSelected = selectedIndex === i;

          let bgClass = "bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-200";
          if (s.classification === "ai-like") {
            bgClass = "bg-rose-950/40 hover:bg-rose-900/50 text-rose-200";
          } else if (s.classification === "uncertain") {
            bgClass = "bg-amber-950/35 hover:bg-amber-900/45 text-amber-200";
          }

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onSelectSentence(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectSentence(i);
              }}
              className={`sentence-highlight ${bgClass} ${
                isSelected ? "sentence-selected ring-1 ring-sky-400" : ""
              }`}
            >
              {s.sentence}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
}
