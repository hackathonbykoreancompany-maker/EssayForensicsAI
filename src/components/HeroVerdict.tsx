"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface HeroVerdictProps {
  score: ScoringResult;
}

export default function HeroVerdict({ score }: HeroVerdictProps) {
  let statusLabel = "Likely Human Authorship";
  let accentColor = "text-stone-100";
  let ringColor = "#78716c"; // stone-500
  let badgeStyle = "bg-stone-800 text-stone-200 border-stone-700";

  if (score.overallScore >= 60) {
    statusLabel = "Potentially AI-Generated";
    accentColor = "text-red-400";
    ringColor = "#ef4444"; // red-500
    badgeStyle = "bg-red-950/60 text-red-300 border-red-800/60";
  } else if (score.overallScore >= 30) {
    statusLabel = "Uncertain / Mixed Signals";
    accentColor = "text-amber-400";
    ringColor = "#f59e0b"; // amber-500
    badgeStyle = "bg-amber-950/60 text-amber-300 border-amber-800/60";
  }

  const confidenceLabel = `${score.confidence.charAt(0).toUpperCase() + score.confidence.slice(1)} Evidence Strength`;

  return (
    <div className="surface-card rounded-2xl p-5 text-center">
      {/* Section label */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Executive Verdict
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeStyle}`}>
          {confidenceLabel}
        </span>
      </div>

      {/* Score Ring Gauge */}
      <div className="flex justify-center mb-3">
        <div
          className="score-ring"
          style={{
            "--ring-color": ringColor,
            "--score-progress": score.overallScore,
          } as React.CSSProperties}
        >
          <div className="score-ring-inner">
            <span className={`text-3xl font-bold tracking-tight leading-none ${accentColor}`}>
              {score.overallScore}%
            </span>
            <span className="text-[9px] font-medium text-stone-400 mt-1 uppercase tracking-wider">
              AI Likelihood
            </span>
          </div>
        </div>
      </div>

      {/* Verdict Label */}
      <h2 className={`text-base font-bold tracking-tight ${accentColor} mb-1`}>
        {statusLabel}
      </h2>
      
      <p className="text-[11px] text-stone-400">
        Calculated from 6 calibrated stylometric features
      </p>
    </div>
  );
}
