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

function conciseReason(s: SentenceResult): string {
  const { evidence, classification, wordCount } = s;

  if (evidence.contributesToUniformRhythm && evidence.passageLengthFlagged) {
    return "Matches both length & rhythm uniformity patterns";
  }
  if (evidence.contributesToUniformRhythm) {
    return "Contributes to uniform cadence sequence";
  }
  if (evidence.passageLengthFlagged) {
    return `${wordCount} words — narrow variance with mean`;
  }
  if (evidence.overusedWordsInSentence.length > 0) {
    const words = evidence.overusedWordsInSentence.slice(0, 2).join(", ");
    return `Repeated phrase tokens: ${words}`;
  }
  if (classification === "human") {
    return "Natural syntactic and length variation";
  }
  return "Mixed stylometric indicators";
}

export default function AnalysisResult({ result, onOpenMethodology }: AnalysisResultProps) {
  const { score, sentences } = result;

  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);

  const aiLikeCount = sentences.filter((s) => s.classification === "ai-like").length;
  const humanLikeCount = sentences.filter((s) => s.classification === "human").length;
  const uncertainCount = sentences.filter((s) => s.classification === "uncertain").length;

  const inspectedSentence = inspectedIndex !== null ? sentences[inspectedIndex] ?? null : null;

  return (
    <div className="space-y-4">
      {/* 1. Executive Verdict */}
      <div className="section-fade-up">
        <HeroVerdict score={score} />
      </div>

      {/* 2. Statistical Sentence Distribution Bar */}
      <div className="surface-card rounded-xl px-4 py-2.5 flex items-center justify-around text-xs font-medium text-stone-300">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400 font-normal">Total:</span>
          <strong className="text-white font-bold">{sentences.length}</strong>
        </div>
        <span className="text-stone-700">&bull;</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-300 font-semibold">{aiLikeCount}</span>
          <span className="text-stone-400">AI-like</span>
        </div>
        <span className="text-stone-700">&bull;</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-amber-300 font-semibold">{uncertainCount}</span>
          <span className="text-stone-400">Uncertain</span>
        </div>
        <span className="text-stone-700">&bull;</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-stone-200 font-semibold">{humanLikeCount}</span>
          <span className="text-stone-400">Human</span>
        </div>
      </div>

      {/* 3. Executive Reasoning Summary */}
      <div className="section-fade-up">
        <WhyThisResult score={score} />
      </div>

      {/* 4. Top Signals */}
      {score.flags.length > 0 && (
        <div className="section-fade-up">
          <DetectedSignals score={score} />
        </div>
      )}

      {/* 5. Passage Stylometry Map */}
      <div className="section-fade-up">
        <SentenceHighlighter
          result={result}
          selectedIndex={inspectedIndex}
          onSelectSentence={(index) => setInspectedIndex(index)}
        />
      </div>

      {/* 6. Sentence Evidence Cards Grid */}
      <div className="section-fade-up">
        <div className="surface-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Sentence Breakdown
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Select any block for granular forensic breakdown
              </p>
            </div>
            <span className="text-[10px] font-mono text-stone-400">
              {sentences.length} units
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {sentences.map((s, i) => {
              const isSelected = inspectedIndex === i;

              let cardBorder = "border-stone-800 bg-stone-900/60 hover:bg-stone-850";
              let statusDot = "bg-stone-400";
              let classLabel = "Human";

              if (s.classification === "ai-like") {
                cardBorder = "border-red-900/40 bg-red-950/25 hover:bg-red-950/40";
                statusDot = "bg-red-500";
                classLabel = "AI-like";
              } else if (s.classification === "uncertain") {
                cardBorder = "border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/35";
                statusDot = "bg-amber-500";
                classLabel = "Uncertain";
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInspectedIndex(i)}
                  className={`p-3 rounded-xl border text-left transition-all ${cardBorder} ${
                    isSelected ? "ring-1 ring-stone-300 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-stone-300 font-mono">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      <span className="text-[10px] font-semibold text-stone-300">
                        {classLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed mb-2">
                    {s.sentence}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1.5 border-t border-stone-800">
                    <span>{s.wordCount} words &bull; {s.lengthBucket}</span>
                    <span className="text-stone-300 font-semibold">Inspect &rarr;</span>
                  </div>

                  <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                    {conciseReason(s)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Sentence Inspector Drawer */}
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

      {/* 8. Advanced Forensic Analysis (Collapsed by default) */}
      <div className="section-fade-up">
        <AdvancedAnalysis result={result} />
      </div>

      {/* 9. Methodology Note */}
      <div className="surface-subtle rounded-xl p-4 text-center space-y-1">
        <p className="text-[11px] text-stone-400 leading-relaxed">
          EssayForensics AI uses deterministic statistical markers (variance, rhythm CV, MATTR, Fano factor), not neural generative approximations.
        </p>
        {onOpenMethodology && (
          <button
            type="button"
            onClick={onOpenMethodology}
            className="text-[11px] font-semibold text-stone-300 hover:text-white transition-colors"
          >
            Review Scientific Methodology &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
