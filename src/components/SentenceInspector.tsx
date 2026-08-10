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

/** Generates plain-English reasons for why this sentence was flagged */
function buildReasons(sentence: SentenceResult): string[] {
  const reasons: string[] = [];
  const { evidence } = sentence;

  if (evidence.passageLengthFlagged) {
    reasons.push("Sentence length is unusually consistent with the passage average");
  }

  if (evidence.contributesToUniformRhythm) {
    reasons.push("Rhythm matches the surrounding passage's uniform pattern");
  }

  if (evidence.passageRhythmFlagged && !evidence.contributesToUniformRhythm) {
    reasons.push("Part of a passage with uniform overall rhythm");
  }

  if (evidence.overusedWordsInSentence.length > 0) {
    const words = evidence.overusedWordsInSentence.slice(0, 3).join(", ");
    reasons.push(`Contains overused wording: ${words}`);
  }

  if (reasons.length === 0) {
    if (sentence.classification === "human") {
      reasons.push("No strong anomaly detected — natural variation observed");
    } else {
      reasons.push("Combination of subtle signals contributed to the classification");
    }
  }

  return reasons;
}

/** Classification display config */
function getClassificationConfig(classification: string) {
  switch (classification) {
    case "ai-like":
      return {
        label: "Potentially AI-like",
        badge: "bg-rose-950/60 text-rose-300 border-rose-800/40",
        border: "border-l-rose-500",
      };
    case "uncertain":
      return {
        label: "Uncertain",
        badge: "bg-amber-950/60 text-amber-300 border-amber-800/40",
        border: "border-l-amber-500",
      };
    default:
      return {
        label: "Likely Human",
        badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
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

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm drawer-overlay"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/90 backdrop-blur-xl border-l border-slate-800 shadow-2xl drawer-panel flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">
                Sentence {sentenceIndex + 1}
              </h3>
              <p className="text-[11px] text-slate-400">
                Forensic Evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Classification */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}>
              {config.label}
            </span>
          </div>

          {/* Full Sentence Text */}
          <div className={`p-4 rounded-xl glass-panel-subtle border-l-4 ${config.border}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sentence Text
            </p>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              &ldquo;{sentence.sentence}&rdquo;
            </p>
          </div>

          {/* Why Was It Flagged? */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-2">
              Why was it flagged?
            </h4>
            <ul className="space-y-2">
              {reasons.map((reason, i) => (
                <li key={i} className="text-[13px] text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence Table */}
          <div className="rounded-xl glass-panel-subtle overflow-hidden">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 pt-3 pb-2">
              Evidence
            </h4>
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="px-4 py-2.5 text-slate-400 font-medium">Sentence length</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{sentence.wordCount} words</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400 font-medium">Passage average</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{passageMean} words</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400 font-medium">Length category</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">{bucketLabel(sentence.lengthBucket)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-400 font-medium">Rhythm</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">
                    {isUniformRhythm ? "Uniform" : "Natural"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signals Contributing */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-2">
              Signals Contributing
            </h4>
            <div className="space-y-1.5">
              {[
                { name: "Sentence Length", active: sentence.evidence.passageLengthFlagged },
                { name: "Sentence Rhythm", active: sentence.evidence.passageRhythmFlagged || sentence.evidence.contributesToUniformRhythm },
                { name: "Repetition", active: sentence.evidence.overusedWordsInSentence.length > 0 },
              ].map((signal) => (
                <div key={signal.name} className="flex items-center justify-between text-[13px] px-3 py-2 rounded-lg glass-panel-subtle">
                  <span className="text-slate-300 font-medium">{signal.name}</span>
                  <span className={signal.active ? "text-emerald-400 font-semibold" : "text-slate-600"}>
                    {signal.active ? "✓" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Signals indicate unusual patterns, not proof of AI authorship
          </p>
        </div>
      </div>
    </>
  );
}
