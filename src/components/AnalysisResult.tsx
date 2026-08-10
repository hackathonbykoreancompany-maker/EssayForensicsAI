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
 * Avoids repeating the same boilerplate on every card.
 */
function getCardReason(sentence: SentenceResult): string {
  const { evidence, classification } = sentence;

  if (evidence.contributesToUniformRhythm) {
    return "Uniform rhythm detected";
  }
  if (evidence.passageLengthFlagged && evidence.passageRhythmFlagged) {
    return "Consistent length and rhythm";
  }
  if (evidence.passageLengthFlagged) {
    return "Unusually consistent length";
  }
  if (evidence.passageRhythmFlagged) {
    return "Part of uniform rhythm pattern";
  }
  if (evidence.overusedWordsInSentence.length > 0) {
    return "Repeated construction detected";
  }
  if (classification === "human") {
    return "Natural variation detected";
  }
  return "No strong anomaly detected";
}

function bucketLabel(bucket: string): string {
  return bucket.charAt(0).toUpperCase() + bucket.slice(1);
}

function classificationLabel(classification: string): string {
  switch (classification) {
    case "ai-like": return "Potentially AI-like";
    case "uncertain": return "Uncertain";
    default: return "Likely Human";
  }
}

export default function AnalysisResult({ result, onOpenMethodology }: AnalysisResultProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const sentences = result.sentences;
  const aiLikeCount = sentences.filter((s) => s.classification === "ai-like").length;
  const humanLikeCount = sentences.filter((s) => s.classification === "human").length;
  const uncertainCount = sentences.filter((s) => s.classification === "uncertain").length;

  const handleSelectSentence = (index: number) => {
    setSelectedIndex(index);
    setInspectorOpen(true);
  };

  const handleCloseInspector = () => {
    setInspectorOpen(false);
  };

  // Classification styles for sentence cards
  const cardStyles = {
    "ai-like": {
      border: "border-l-rose-500",
      badge: "bg-rose-950/60 text-rose-300 border-rose-800/40",
    },
    uncertain: {
      border: "border-l-amber-500",
      badge: "bg-amber-950/60 text-amber-300 border-amber-800/40",
    },
    human: {
      border: "border-l-emerald-500",
      badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
    },
  };

  return (
    <div className="space-y-5">
      {/* 1. Hero Verdict */}
      <div className="result-section">
        <HeroVerdict score={result.score} />
      </div>

      {/* 2. Compact Summary Row */}
      <div className="result-section">
        <div className="flex items-center justify-center gap-6 flex-wrap px-4 py-3 rounded-xl glass-panel shadow-xl">
          <div className="text-center">
            <span className="text-[18px] font-extrabold text-white leading-none">{sentences.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Sentences analyzed</span>
          </div>
          <span className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <span className="text-[18px] font-extrabold text-rose-400 leading-none">{aiLikeCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">AI-like</span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-extrabold text-emerald-400 leading-none">{humanLikeCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Human-like</span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-extrabold text-amber-400 leading-none">{uncertainCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Uncertain</span>
          </div>
          {(result.wordCount > 0 || result.characterCount > 0) && (
            <>
              <span className="w-px h-8 bg-slate-800" />
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                {result.wordCount > 0 && <span>{result.wordCount.toLocaleString()} words</span>}
                {result.characterCount > 0 && <span>{result.characterCount.toLocaleString()} chars</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Why This Result? */}
      <div className="result-section">
        <WhyThisResult score={result.score} />
      </div>

      {/* 4. Detected Signals (top 3) */}
      <div className="result-section">
        <DetectedSignals score={result.score} />
      </div>

      {/* 5. Essay Overview (compact highlighter) */}
      <div className="result-section">
        <SentenceHighlighter
          result={result}
          selectedIndex={selectedIndex}
          onSelectSentence={handleSelectSentence}
        />
      </div>

      {/* 6. Sentence-Level Evidence Cards */}
      <div className="result-section">
        <div className="rounded-2xl glass-panel p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800/80 mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
              Sentence-Level Evidence
            </h3>
            <p className="text-[12px] text-slate-400 mt-0.5">
              See which sentences contributed to the overall signal
            </p>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {sentences.map((sentence, index) => {
              const styles = cardStyles[sentence.classification];
              const isSelected = selectedIndex === index;
              const preview = sentence.sentence.length > 80
                ? sentence.sentence.slice(0, 80) + "…"
                : sentence.sentence;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSentence(index)}
                  className={`w-full text-left p-3.5 rounded-xl border border-l-[3px] transition-all ${styles.border} ${
                    isSelected
                      ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950 border-slate-700 bg-slate-800/60"
                      : "border-slate-800/80 glass-panel-subtle hover:bg-slate-800/40"
                  }`}
                >
                  {/* Top row: sentence number + classification badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[12px] font-bold font-mono text-slate-400">
                      Sentence {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                      {classificationLabel(sentence.classification)}
                    </span>
                  </div>

                  {/* Sentence preview */}
                  <p className="text-[12px] text-slate-200 leading-relaxed mb-2 line-clamp-2">
                    &ldquo;{preview}&rdquo;
                  </p>

                  {/* Bottom row: metadata + reason + inspect */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <span>{sentence.wordCount} words</span>
                      <span>·</span>
                      <span>{bucketLabel(sentence.lengthBucket)}</span>
                    </div>
                    <span className="text-slate-400 font-medium hidden sm:inline">
                      {getCardReason(sentence)}
                    </span>
                    <span className="text-indigo-400 font-semibold flex-shrink-0">
                      Inspect →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Advanced Analysis (collapsed) */}
      <div className="result-section">
        <AdvancedAnalysis result={result} />
      </div>

      {/* 8. Methodology + Limitations */}
      <div className="result-section">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Methodology link */}
          {onOpenMethodology && (
            <button
              type="button"
              onClick={onOpenMethodology}
              className="text-[12px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              How this analysis works
            </button>
          )}

          {/* Limitation statement */}
          <details className="text-[11px] text-slate-400 group">
            <summary className="cursor-pointer font-medium hover:text-slate-300 transition-colors select-none">
              Limitations
            </summary>
            <p className="mt-2 text-slate-400 leading-relaxed max-w-xl">
              This system provides an evidence-based likelihood signal based on measurable linguistic patterns.
              It cannot definitively determine authorship and may produce false positives or false negatives.
              Results should be used as one input among many in any evaluation process.
            </p>
          </details>
        </div>
      </div>

      {/* Sentence Inspector Drawer */}
      {inspectorOpen && selectedIndex !== null && sentences[selectedIndex] && (
        <SentenceInspector
          sentence={sentences[selectedIndex]}
          sentenceIndex={selectedIndex}
          passageMean={result.sentenceLength.mean}
          sentenceLength={result.sentenceLength}
          isUniformRhythm={result.sentenceRhythm.isUniformRhythm}
          onClose={handleCloseInspector}
        />
      )}
    </div>
  );
}
