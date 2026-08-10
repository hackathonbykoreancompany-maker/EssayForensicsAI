"use client";

import React, { useState } from "react";
import type { EssayAnalysisResult, SentenceResult } from "../services/essayAnalysisService";

import HeroVerdict from "./HeroVerdict";
import WhyThisResult from "./WhyThisResult";
import DetectedSignals from "./DetectedSignals";
import SentenceHighlighter from "./SentenceHighlighter";
import SentenceInspector from "./SentenceInspector";
import AdvancedAnalysis from "./AdvancedAnalysis";

interface AnalysisResultProps {
  result: EssayAnalysisResult;
  onOpenMethodology?: () => void;
}

/**
 * Concise reason for a sentence card — one meaningful line.
 * Prioritises the most informative evidence signal.
 */
function conciseReason(s: SentenceResult): string {
  const { evidence, classification, wordCount } = s;

  if (evidence.contributesToUniformRhythm && evidence.passageLengthFlagged) {
    return "Matches both length and rhythm uniformity patterns";
  }
  if (evidence.contributesToUniformRhythm) {
    return "Contributes to the passage's uniform rhythm pattern";
  }
  if (evidence.passageLengthFlagged) {
    return `${wordCount} words — consistent with passage average`;
  }
  if (evidence.overusedWordsInSentence.length > 0) {
    const words = evidence.overusedWordsInSentence.slice(0, 2).join(", ");
    return `Contains repeated wording: ${words}`;
  }
  if (classification === "human") {
    return "Shows natural structural variation";
  }
  return "Mixed signals — no single strong indicator";
}

export default function AnalysisResult({ result, onOpenMethodology }: AnalysisResultProps) {
  const { score, sentences } = result;

  // Selected sentence for the inspector drawer
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);

  // Summary counts from authoritative sentences[]
  const aiLikeCount = sentences.filter((s) => s.classification === "ai-like").length;
  const humanLikeCount = sentences.filter((s) => s.classification === "human").length;
  const uncertainCount = sentences.filter((s) => s.classification === "uncertain").length;

  // The sentence currently being inspected (for the drawer)
  const inspectedSentence = inspectedIndex !== null ? sentences[inspectedIndex] ?? null : null;

  return (
    <div className="space-y-5">
      {/* ── 1. VERDICT ── */}
      <div className="section-fade-up" style={{ animationDelay: "0ms" }}>
        <HeroVerdict score={score} />
      </div>

      {/* Compact stats bar */}
      <div className="section-fade-up flex items-center justify-center gap-4 text-[12px] font-semibold" style={{ animationDelay: "80ms" }}>
        <span className="text-slate-400">{sentences.length} sentences</span>
        <span className="text-slate-700 dark:text-slate-600">|</span>
        <span className="text-rose-400">{aiLikeCount} AI-like</span>
        <span className="text-slate-700 dark:text-slate-600">|</span>
        <span className="text-amber-400">{uncertainCount} uncertain</span>
        <span className="text-slate-700 dark:text-slate-600">|</span>
        <span className="text-emerald-400">{humanLikeCount} human</span>
      </div>

      {/* ── 2. WHY ── */}
      <div className="section-fade-up" style={{ animationDelay: "160ms" }}>
        <WhyThisResult score={score} />
      </div>

      {/* ── 3. TOP SIGNALS ── */}
      {score.flags.length > 0 && (
        <div className="section-fade-up" style={{ animationDelay: "240ms" }}>
          <DetectedSignals score={score} />
        </div>
      )}

      {/* ── 4. ESSAY OVERVIEW (compact highlighter) ── */}
      <div className="section-fade-up" style={{ animationDelay: "320ms" }}>
        <SentenceHighlighter
          result={result}
          selectedIndex={inspectedIndex}
          onSelectSentence={(index) => setInspectedIndex(index)}
        />
      </div>

      {/* ── 5. SENTENCE EVIDENCE CARDS ── */}
      <div className="section-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-3">
          <div className="pb-3 border-b border-slate-700/50">
            <h3 className="text-[15px] font-bold text-white tracking-tight">
              Sentence Evidence
            </h3>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Tap a card to inspect detailed evidence for that sentence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {sentences.map((s, i) => {
              const isSelected = inspectedIndex === i;

              let cardStyle = "bg-emerald-950/20 border-emerald-800/30 hover:bg-emerald-950/40";
              let statusDot = "bg-emerald-500";
              let classLabel = "Human";

              if (s.classification === "ai-like") {
                cardStyle = "bg-rose-950/25 border-rose-800/30 hover:bg-rose-950/45";
                statusDot = "bg-rose-500";
                classLabel = "AI-like";
              } else if (s.classification === "uncertain") {
                cardStyle = "bg-amber-950/20 border-amber-800/30 hover:bg-amber-950/40";
                statusDot = "bg-amber-500";
                classLabel = "Uncertain";
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInspectedIndex(i)}
                  className={`p-3 rounded-xl border text-left transition-all ${cardStyle} ${
                    isSelected ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950 shadow-sm" : ""
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[12px] font-bold text-slate-300 font-mono">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                      <span className="text-[10px] font-semibold text-slate-400">
                        {classLabel}
                      </span>
                    </div>
                  </div>

                  {/* Sentence preview */}
                  <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed mb-2">
                    {s.sentence}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/50">
                    <span>{s.wordCount} words · {s.lengthBucket}</span>
                    <span className="text-indigo-400 font-semibold">Inspect →</span>
                  </div>

                  {/* Concise reason */}
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {conciseReason(s)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 6. INSPECT SELECTED SENTENCE (drawer) ── */}
      {inspectedSentence && inspectedIndex !== null && (
        <SentenceInspector
          sentence={inspectedSentence}
          sentenceIndex={inspectedIndex}
          passageMean={result.sentenceLength.mean}
          sentenceLength={result.sentenceLength}
          isUniformRhythm={result.sentenceRhythm.isUniformRhythm}
          onClose={() => setInspectedIndex(null)}
        />
      )}

      {/* ── 7. ADVANCED ANALYSIS (collapsed) ── */}
      <div className="section-fade-up" style={{ animationDelay: "480ms" }}>
        <AdvancedAnalysis result={result} />
      </div>

      {/* ── METHODOLOGY / LIMITATIONS ── */}
      <div className="section-fade-up text-center py-4" style={{ animationDelay: "560ms" }}>
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg mx-auto">
          This analysis uses statistical patterns only, not neural AI detectors.
          Results indicate unusual structural patterns, not proof of AI authorship.
        </p>
        {onOpenMethodology && (
          <button
            type="button"
            onClick={onOpenMethodology}
            className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View Full Methodology →
          </button>
        )}
      </div>
    </div>
  );
}
