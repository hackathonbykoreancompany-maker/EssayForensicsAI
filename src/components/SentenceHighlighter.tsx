"use client";

import React from "react";
import type { EssayAnalysisResult, SentenceResult } from "../services/essayAnalysisService";

interface SentenceHighlighterProps {
  result: EssayAnalysisResult;
  selectedIndex: number | null;
  onSelectSentence: (index: number) => void;
}

/**
 * Compact visual essay overview — renders the original essay text with
 * subtle sentence-level color tints by classification.
 */
export default function SentenceHighlighter({
  result,
  selectedIndex,
  onSelectSentence,
}: SentenceHighlighterProps) {
  const sentences = result.sentences;

  if (sentences.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
            Essay Overview
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Click any sentence to inspect
          </p>
        </div>

        {/* Compact legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> AI-like
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Uncertain
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Human
          </span>
        </div>
      </div>

      {/* Essay text with inline sentence highlighting */}
      <div className="text-[13px] leading-[1.85] text-slate-200">
        {sentences.map((sentence: SentenceResult, index: number) => {
          const isSelected = selectedIndex === index;

          let highlightClass = "bg-emerald-950/35 hover:bg-emerald-950/60 text-emerald-200";
          if (sentence.classification === "ai-like") {
            highlightClass = "bg-rose-950/35 hover:bg-rose-950/60 text-rose-200";
          } else if (sentence.classification === "uncertain") {
            highlightClass = "bg-amber-950/35 hover:bg-amber-950/60 text-amber-200";
          }

          return (
            <span
              key={index}
              onClick={() => onSelectSentence(index)}
              className={`sentence-highlight ${highlightClass} ${isSelected ? "sentence-selected" : ""}`}
              title={`Sentence ${index + 1} — ${sentence.classification === "ai-like" ? "Potentially AI-like" : sentence.classification === "uncertain" ? "Uncertain" : "Likely Human"}`}
            >
              {sentence.sentence}
            </span>
          );
        })}
      </div>
    </div>
  );
}
