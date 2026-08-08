"use client";

import React from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { AnalyzedSentenceInfo } from "./SentenceHighlighter";

interface EvidencePanelProps {
  result: EssayAnalysisResult;
  selectedSentence: AnalyzedSentenceInfo | null;
}

export default function EvidencePanel({ result, selectedSentence }: EvidencePanelProps) {
  const { sentenceLength, sentenceRhythm, repetition, score } = result;

  // Status badge formatting
  let statusBadgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40";
  let statusTitle = "Likely human";
  let confidenceTag = "High Confidence";

  if (selectedSentence) {
    if (selectedSentence.status === "ai-like") {
      statusBadgeStyle = "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40";
      statusTitle = "Potentially AI-like";
      confidenceTag = "Moderate Confidence";
    } else if (selectedSentence.status === "uncertain") {
      statusBadgeStyle = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40";
      statusTitle = "Uncertain / Mixed Signals";
      confidenceTag = "Low Confidence";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                Evidence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedSentence ? `Passage #${selectedSentence.index + 1} Signals` : "Passage Signal Evidence"}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusBadgeStyle}`}>
            {confidenceTag}
          </span>
        </div>

        {/* Dynamic Sentence Inspector or Passage Overview */}
        <div className="mt-4 space-y-4">
          {selectedSentence ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Selected Sentence #{selectedSentence.index + 1}</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedSentence.wordCount} Words ({selectedSentence.bucket})</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pt-1">
                Why was this flagged?
              </h4>
              <ul className="space-y-1.5 pt-1">
                {selectedSentence.evidenceSignals.map((sig, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <span className="text-xl">👉</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click any sentence on the left
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select a sentence card to inspect why it was flagged or categorized.
              </p>
            </div>
          )}

          {/* Core Evidence Signals Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Linguistic Evidence Breakdown
            </h4>

            {/* Signal 1: Length Regularity */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">Sentence Length StdDev</span>
                <span className="font-bold text-slate-900 dark:text-white">{sentenceLength.stdDev} words</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${sentenceLength.stdDev < 4 ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (sentenceLength.stdDev / 10) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {sentenceLength.stdDev < 4
                  ? "✓ Unusually low length variation detected (stdDev < 4.0)"
                  : "✓ Natural length variation observed across sentences"}
              </p>
            </div>

            {/* Signal 2: Rhythm Uniformity */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">Rhythm Variation (CV)</span>
                <span className="font-bold text-slate-900 dark:text-white">{sentenceRhythm.coefficientOfVariation}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {sentenceRhythm.isUniformRhythm
                  ? "⚠️ Uniform rhythm profile detected (CV < 0.25 threshold)"
                  : "✓ Rhythm profile shows natural human variation"}
              </p>
            </div>

            {/* Signal 3: Vocabulary Repetition */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">Overused Content Words</span>
                <span className="font-bold text-slate-900 dark:text-white">{repetition.overusedWords.length} terms</span>
              </div>
              {repetition.overusedWords.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {repetition.overusedWords.slice(0, 4).map((item) => (
                    <span key={item.term} className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {item.term} ({item.count}x)
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No overused terms found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        Powered by EssayForensics Signal Engine
      </div>
    </div>
  );
}
