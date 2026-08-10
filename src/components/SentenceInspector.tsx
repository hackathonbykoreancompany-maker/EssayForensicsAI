"use client";

import React, { useEffect } from "react";
import type { SentenceResult } from "../services/essayAnalysisService";
import type { SentenceLengthResult } from "../services/signals/sentenceLength";

interface SentenceInspectorProps {
  sentence: SentenceResult;
  sentenceIndex: number;
  passageMean: number;
  sentenceLength: SentenceLengthResult;
  isUniformRhythm: boolean;
  onClose: () => void;
}

function buildReasons(sentence: SentenceResult): string[] {
  const reasons: string[] = [];
  const { evidence } = sentence;

  if (evidence.passageLengthFlagged) {
    reasons.push("Sentence length is tightly clustered around the passage average");
  }

  if (evidence.contributesToUniformRhythm) {
    reasons.push("Rhythm matches the surrounding passage's uniform cadence pattern");
  }

  if (evidence.passageRhythmFlagged && !evidence.contributesToUniformRhythm) {
    reasons.push("Part of a document with below-average rhythm variation");
  }

  if (evidence.overusedWordsInSentence.length > 0) {
    const words = evidence.overusedWordsInSentence.slice(0, 3).join(", ");
    reasons.push(`Contains recurring vocabulary tokens: ${words}`);
  }

  if (reasons.length === 0) {
    if (sentence.classification === "human") {
      reasons.push("Natural length variation and structural asymmetry observed");
    } else {
      reasons.push("Combined subtle stylometric markers contributed to classification");
    }
  }

  return reasons;
}

function getClassificationConfig(classification: string) {
  switch (classification) {
    case "ai-like":
      return {
        label: "Potentially AI-Generated",
        badge: "bg-rose-950/70 text-rose-300 border-rose-800/60",
        border: "border-l-rose-500",
      };
    case "uncertain":
      return {
        label: "Uncertain / Mixed Marker",
        badge: "bg-amber-950/70 text-amber-300 border-amber-800/60",
        border: "border-l-amber-500",
      };
    default:
      return {
        label: "Likely Human Writing",
        badge: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
        border: "border-l-emerald-500",
      };
  }
}

function bucketLabel(bucket: string): string {
  return bucket.charAt(0).toUpperCase() + bucket.slice(1);
}

export default function SentenceInspector({
  sentence,
  sentenceIndex,
  passageMean,
  sentenceLength,
  isUniformRhythm,
  onClose,
}: SentenceInspectorProps) {
  const config = getClassificationConfig(sentence.classification);
  const reasons = buildReasons(sentence);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm drawer-overlay"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl drawer-panel flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-mono font-bold text-xs">
              #{sentenceIndex + 1}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Sentence Inspector
              </h3>
              <p className="text-[11px] text-slate-400">
                Detailed Forensic Breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Classification Status */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${config.badge}`}>
              {config.label}
            </span>
          </div>

          {/* Full Sentence Quote */}
          <div className={`p-4 rounded-xl surface-subtle border-l-4 ${config.border}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Sentence Content
            </p>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              &ldquo;{sentence.sentence}&rdquo;
            </p>
          </div>

          {/* Forensic Reasons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Stylometric Findings
            </h4>
            <ul className="space-y-2">
              {reasons.map((reason, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-sky-400 font-bold mt-0.5">&bull;</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence Metrics Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Comparative Evidence Table
              </h4>
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="px-4 py-2.5 text-slate-400">Sentence Length</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{sentence.wordCount} words</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400">Passage Mean Length</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{passageMean} words</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400">Length Category</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{bucketLabel(sentence.lengthBucket)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400">Passage Cadence</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">
                    {isUniformRhythm ? "Uniform (AI marker)" : "Natural Variation"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Active Signal Check */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Contributing Analyzers
            </h4>
            <div className="space-y-1.5">
              {[
                { name: "Sentence Length Variance", active: sentence.evidence.passageLengthFlagged },
                { name: "Cadence Uniformity", active: sentence.evidence.passageRhythmFlagged || sentence.evidence.contributesToUniformRhythm },
                { name: "Vocabulary Repetition", active: sentence.evidence.overusedWordsInSentence.length > 0 },
              ].map((signal) => (
                <div key={signal.name} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-medium">{signal.name}</span>
                  <span className={signal.active ? "text-emerald-400 font-semibold" : "text-slate-600 font-mono"}>
                    {signal.active ? "Triggered" : "Normal"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 text-center">
          <p className="text-[10px] text-slate-400">
            Signals indicate stylistic anomalies compared to standard corpus baselines.
          </p>
        </div>
      </div>
    </>
  );
}
