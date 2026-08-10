"use client";

import React from "react";
import type { EssayAnalysisResult, SentenceResult } from "../services/essayAnalysisService";

interface SentenceHighlighterProps {
  result: EssayAnalysisResult;
  selectedIndex: number | null;
  onSelectSentence: (index: number) => void;
}

/**
 * Compact essay-text-only highlighter.
 *
 * Renders the original essay text with subtle classification-based
 * color tints on each sentence. Click a sentence to inspect it.
 *
 * No cards, no stats, no evidence — just highlighted essay text.
 */
export default function SentenceHighlighter({
  result,
  selectedIndex,
  onSelectSentence,
}: SentenceHighlighterProps) {
  const { sentences } = result;

  if (!sentences || sentences.length === 0) {
    return (
      <div className="rounded-2xl glass-panel p-5 shadow-xl">
        <p className="text-sm text-slate-400 italic">
          No sentences to display.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-700/50">
        <div>
          <h3 className="text-[15px] font-bold text-white tracking-tight">
            Essay Overview
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Click any sentence to inspect its forensic evidence
          </p>
        </div>

        {/* Compact legend */}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">AI-like</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Uncertain</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Human</span>
          </span>
        </div>
      </div>

      {/* Essay text with inline sentence highlighting */}
      <div className="text-[14px] leading-[1.85] text-slate-200">
        {sentences.map((s: SentenceResult, i: number) => {
          const isSelected = selectedIndex === i;

          let bgClass = "bg-emerald-950/20 hover:bg-emerald-950/40";
          if (s.classification === "ai-like") {
            bgClass = "bg-rose-950/30 hover:bg-rose-950/50";
          } else if (s.classification === "uncertain") {
            bgClass = "bg-amber-950/25 hover:bg-amber-950/45";
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
                isSelected ? "sentence-selected" : ""
              }`}
            >
              {s.sentence}
            </span>
          );
        })}
      </div>
    </div>
  );
}
