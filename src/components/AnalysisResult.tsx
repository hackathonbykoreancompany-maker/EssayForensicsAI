"use client";

import React, { useState } from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { RepeatedTerm } from "../services/signals/repetition";
import type { SentenceLengthBucket } from "../services/signals/sentenceRhythm";

import OverviewSummary from "./OverviewSummary";
import SentenceHighlighter, { type AnalyzedSentenceInfo, classifySentences } from "./SentenceHighlighter";
import EvidencePanel from "./EvidencePanel";

interface AnalysisResultProps {
  result: EssayAnalysisResult;
}

const BUCKET_STYLES: Record<SentenceLengthBucket, string> = {
  short: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
  medium: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30",
  long: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
};

function BucketPill({ bucket, index }: { bucket: SentenceLengthBucket; index: number }) {
  return (
    <span
      className={`inline-block w-3 h-3.5 rounded-sm border ${BUCKET_STYLES[bucket]}`}
      title={`Sentence ${index + 1}: ${bucket}`}
    />
  );
}

function TermTable({ terms, emptyMessage }: { terms: RepeatedTerm[]; emptyMessage: string }) {
  if (terms.length === 0) {
    return <p className="text-xs text-slate-400 italic py-1">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <th className="pb-1.5 font-semibold">Term</th>
            <th className="pb-1.5 font-semibold text-right">Count</th>
            <th className="pb-1.5 font-semibold text-right">Freq</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {terms.slice(0, 5).map((t) => (
            <tr key={t.term}>
              <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{t.term}</td>
              <td className="py-1.5 text-right font-medium text-slate-700 dark:text-slate-300">{t.count}</td>
              <td className="py-1.5 text-right text-slate-500 dark:text-slate-400">
                {(t.frequency * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const { sentenceLength, sentenceRhythm, repetition, score } = result;

  // Selected sentence state for Evidence Panel
  const [selectedSentence, setSelectedSentence] = useState<AnalyzedSentenceInfo | null>(null);

  // Derive sentence stats
  const classified = classifySentences(result);
  const aiLikeCount = classified.filter((s) => s.status === "ai-like").length;
  const humanLikeCount = classified.filter((s) => s.status === "human").length;
  const uncertainCount = classified.filter((s) => s.status === "uncertain").length;

  const stats = {
    totalSentences: classified.length,
    aiLikeCount,
    humanLikeCount,
    uncertainCount,
  };

  return (
    <div className="space-y-5">
      {/* Top Overview Card */}
      <OverviewSummary score={score} stats={stats} />

      {/* Main Evidence Grid: Highlighting + Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <SentenceHighlighter
            result={result}
            selectedIndex={selectedSentence ? selectedSentence.index : null}
            onSelectSentence={(sentence) => setSelectedSentence(sentence)}
          />
        </div>

        <div className="lg:col-span-5">
          <EvidencePanel
            result={result}
            selectedSentence={selectedSentence}
          />
        </div>
      </div>

      {/* Secondary Signal Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sentence Rhythm Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sentence Rhythm Profile
            </h3>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                sentenceRhythm.isUniformRhythm
                  ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40"
              }`}
            >
              {sentenceRhythm.isUniformRhythm ? "⚠️ Uniform Rhythm" : "✓ Natural Rhythm"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {sentenceRhythm.coefficientOfVariation}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Coefficient of Variation (CV)
            </span>
          </div>

          {sentenceRhythm.pattern.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Sentence Sequence Pattern</span>
                <div className="flex gap-2 font-mono">
                  <span className="text-sky-600 dark:text-sky-300">■ &le;10w</span>
                  <span className="text-violet-600 dark:text-violet-300">■ 11-24w</span>
                  <span className="text-amber-600 dark:text-amber-300">■ &ge;25w</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 max-h-24 overflow-y-auto">
                {sentenceRhythm.pattern.map((bucket, i) => (
                  <BucketPill key={i} bucket={bucket} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary & Repetition Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Vocabulary & Phrase Repetition
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Overused Content Words ({repetition.uniqueWordCount} unique tokens analyzed)
              </p>
              <TermTable
                terms={repetition.overusedWords}
                emptyMessage="No overused content words detected."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Repeated Bigrams
                </p>
                <TermTable
                  terms={repetition.repeatedBigrams}
                  emptyMessage="None"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Repeated Trigrams
                </p>
                <TermTable
                  terms={repetition.repeatedTrigrams}
                  emptyMessage="None"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

