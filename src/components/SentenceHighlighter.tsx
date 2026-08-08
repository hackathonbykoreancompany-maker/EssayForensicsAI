"use client";

import React from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { SentenceLengthBucket } from "../services/signals/sentenceRhythm";

export interface AnalyzedSentenceInfo {
  index: number;
  text: string;
  wordCount: number;
  bucket: SentenceLengthBucket;
  status: "ai-like" | "uncertain" | "human";
  confidenceLabel: string;
  evidenceSignals: string[];
}

interface SentenceHighlighterProps {
  result: EssayAnalysisResult;
  selectedIndex: number | null;
  onSelectSentence: (sentenceInfo: AnalyzedSentenceInfo) => void;
  onStatsCalculated?: (stats: { totalSentences: number; aiLikeCount: number; humanLikeCount: number; uncertainCount: number }) => void;
}

export function classifySentences(result: EssayAnalysisResult): AnalyzedSentenceInfo[] {
  const { sentenceLength, sentenceRhythm, repetition } = result;
  const lengths = sentenceLength.lengths;
  const mean = sentenceLength.mean;
  const stdDev = sentenceLength.stdDev;
  const isUniformRhythm = sentenceRhythm.isUniformRhythm;
  const overusedWordsList = repetition.overusedWords.map((w) => w.term);
  const repeatedTrigramsList = repetition.repeatedTrigrams.map((t) => t.term);

  // Derive sentences from lengths / patterns
  return sentenceRhythm.pattern.map((bucket, index) => {
    const wCount = lengths[index] || 0;
    const signals: string[] = [];

    // Check sentence length variance
    const diffFromMean = Math.abs(wCount - mean);
    if (stdDev < 5 && diffFromMean <= 3) {
      signals.push(`Unusually regular sentence length (${wCount} words vs mean ${mean})`);
    }

    // Check rhythm pattern uniformity
    if (isUniformRhythm) {
      signals.push("Part of a suspiciously uniform sentence rhythm sequence");
    }

    // Determine sentence status
    let status: "ai-like" | "uncertain" | "human" = "human";
    let confidenceLabel = "High Human Likelihood";

    if (signals.length >= 2 || (isUniformRhythm && stdDev < 4.5)) {
      status = "ai-like";
      confidenceLabel = "Potentially AI-like (Moderate Confidence)";
    } else if (signals.length === 1 || (stdDev < 6 && diffFromMean <= 4)) {
      status = "uncertain";
      confidenceLabel = "Uncertain / Mixed Signals";
    } else {
      status = "human";
      confidenceLabel = "Likely Human Writing Pattern";
      signals.push("Shows natural length variation compared to passage mean");
    }

    return {
      index,
      text: `[Sentence ${index + 1}]`, // Will be populated with actual text
      wordCount: wCount,
      bucket,
      status,
      confidenceLabel,
      evidenceSignals: signals,
    };
  });
}

export default function SentenceHighlighter({
  result,
  selectedIndex,
  onSelectSentence,
}: SentenceHighlighterProps) {
  // Extract sentences from result data
  const sentenceRhythm = result.sentenceRhythm;
  const sentenceLength = result.sentenceLength;
  const overusedWords = result.repetition.overusedWords.map((w) => w.term.toLowerCase());
  const repeatedTrigrams = result.repetition.repeatedTrigrams.map((t) => t.term.toLowerCase());

  // Split logic matching backend behavior
  const sentenceLengths = sentenceLength.lengths;
  const mean = sentenceLength.mean;
  const stdDev = sentenceLength.stdDev;
  const isUniformRhythm = sentenceRhythm.isUniformRhythm;

  // We map indices to classification
  const items: AnalyzedSentenceInfo[] = sentenceLengths.map((wCount, index) => {
    const bucket = sentenceRhythm.pattern[index] || "medium";
    const signals: string[] = [];

    const diffFromMean = Math.abs(wCount - mean);
    if (stdDev < 5 && diffFromMean <= 3) {
      signals.push(`Unusually regular length (${wCount} words vs passage mean ${mean})`);
    }
    if (isUniformRhythm) {
      signals.push("Part of a uniform rhythm sequence with low variation (CV < 0.25)");
    }
    if (stdDev < 4) {
      signals.push(`Low sentence variance (StdDev: ${stdDev})`);
    }

    let status: "ai-like" | "uncertain" | "human" = "human";
    let confidenceLabel = "Likely Human Writing";

    if (isUniformRhythm && stdDev < 5) {
      status = "ai-like";
      confidenceLabel = "Potentially AI-like (Moderate Confidence)";
    } else if (signals.length >= 1 && stdDev < 6) {
      status = "uncertain";
      confidenceLabel = "Uncertain / Mixed Signals";
    } else {
      status = "human";
      confidenceLabel = "Likely Human Pattern";
      if (signals.length === 0) {
        signals.push("Natural sentence length variation observed");
      }
    }

    return {
      index,
      text: "", // placeholder
      wordCount: wCount,
      bucket,
      status,
      confidenceLabel,
      evidenceSignals: signals,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
      {/* Header with Legend */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
            Sentence-Level Forensic Inspection
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Click any highlighted sentence to inspect underlying forensic evidence
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[12px] font-semibold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Potentially AI-like
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Uncertain
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Likely Human
          </span>
        </div>
      </div>

      {/* Sentence Sequence Grid / List */}
      <div className="space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Select a sentence block below to examine signal details:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isSelected = selectedIndex === item.index;

            let badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
            let statusBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";

            if (item.status === "ai-like") {
              badgeStyle = "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60";
              statusBadge = "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300";
            } else if (item.status === "uncertain") {
              badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
              statusBadge = "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300";
            }

            return (
              <button
                key={item.index}
                type="button"
                onClick={() => onSelectSentence(item)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${badgeStyle} ${
                  isSelected ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 shadow-sm" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-bold font-mono">
                    Sentence #{item.index + 1}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusBadge}`}>
                    {item.wordCount} words ({item.bucket})
                  </span>
                </div>

                <p className="text-[12px] line-clamp-2 leading-relaxed opacity-90 font-medium">
                  {item.evidenceSignals[0]}
                </p>

                <div className="flex items-center justify-between text-[10px] font-medium pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <span>{item.confidenceLabel}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Inspect →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
