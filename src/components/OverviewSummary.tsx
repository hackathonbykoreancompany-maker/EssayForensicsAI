"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

export interface SentenceClassificationStats {
  totalSentences: number;
  aiLikeCount: number;
  humanLikeCount: number;
  uncertainCount: number;
}

interface OverviewSummaryProps {
  score: ScoringResult;
  stats: SentenceClassificationStats;
}

export default function OverviewSummary({ score, stats }: OverviewSummaryProps) {
  // Determine status badge styling based on overallScore
  let statusBg = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40";
  let statusLabel = "Likely human";
  let statusIcon = "✓";
  let accentColor = "text-emerald-600 dark:text-emerald-400";
  let barGradient = "from-emerald-500 to-teal-500";

  if (score.overallScore >= 60) {
    statusBg = "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40";
    statusLabel = "Potentially AI-like";
    statusIcon = "⚠️";
    accentColor = "text-rose-600 dark:text-rose-400";
    barGradient = "from-amber-500 via-rose-500 to-red-500";
  } else if (score.overallScore >= 30) {
    statusBg = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40";
    statusLabel = "Uncertain";
    statusIcon = "🔍";
    accentColor = "text-amber-600 dark:text-amber-400";
    barGradient = "from-yellow-500 to-amber-500";
  }

  // Confidence styling
  const confidenceStyles = {
    low: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    medium: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40",
    high: "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40",
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
      {/* Top Title & Assessment Row */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Analysis Overview
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border uppercase tracking-wider ${confidenceStyles[score.confidence]}`}>
              {score.confidence} Evidence strength
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{statusIcon}</span>
            <h3 className={`text-[22px] font-bold tracking-tight ${accentColor}`}>
              {statusLabel}
            </h3>
          </div>
        </div>

        {/* Aggregate AI Likelihood Indicator */}
        <div className="text-right bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`text-[28px] font-extrabold tracking-tight ${accentColor}`}>
              {score.overallScore}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            AI Likelihood Signal
          </span>
        </div>
      </div>

      {/* Progress / Signal Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>Human-like Characteristics</span>
          <span>Potentially AI-like Characteristics</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200/60 dark:border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
            style={{ width: `${score.overallScore}%` }}
          />
        </div>
      </div>

      {/* Primary Evidence Passage Counters */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 leading-relaxed">
          * Note: Sentence classifications flag local length and rhythm anomalies. The overall likelihood signal above incorporates additional passage-level metrics (e.g., vocabulary, burstiness) that cannot be mapped to individual sentences.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-center">
            <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Sentences analyzed</span>
            <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 leading-none">
              {stats.totalSentences}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 flex flex-col justify-center">
            <span className="text-[13px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Potentially AI-like
            </span>
            <span className="text-[28px] font-extrabold text-rose-900 dark:text-rose-200 tracking-tight mt-0.5 leading-none">
              {stats.aiLikeCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col justify-center">
            <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Likely human
            </span>
            <span className="text-[28px] font-extrabold text-emerald-900 dark:text-emerald-200 tracking-tight mt-0.5 leading-none">
              {stats.humanLikeCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex flex-col justify-center">
            <span className="text-[13px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Uncertain
            </span>
            <span className="text-[28px] font-extrabold text-amber-900 dark:text-amber-200 tracking-tight mt-0.5 leading-none">
              {stats.uncertainCount}
            </span>
          </div>
        </div>
      </div>

      {/* Flag Badges */}
      {score.flags.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Primary Detected Risk Flags
          </span>
          <div className="flex flex-wrap gap-2">
            {score.flags.map((flag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/40"
              >
                <span className="text-rose-500">⚠️</span>
                <span>{flag}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
