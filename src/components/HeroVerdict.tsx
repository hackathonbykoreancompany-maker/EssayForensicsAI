"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface HeroVerdictProps {
  score: ScoringResult;
}

export default function HeroVerdict({ score }: HeroVerdictProps) {
  let statusLabel = "Likely Human Writing";
  let accentColor = "text-emerald-400";
  let ringColor = "#10b981"; // emerald-500
  let badgeStyle = "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";

  if (score.overallScore >= 60) {
    statusLabel = "Potentially AI-Generated";
    accentColor = "text-rose-400";
    ringColor = "#f43f5e"; // rose-500
    badgeStyle = "bg-rose-950/60 text-rose-300 border-rose-800/60";
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
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Executive Verdict
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
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
            <span className={`text-3xl font-extrabold tracking-tight leading-none ${accentColor}`}>
              {score.overallScore}%
            </span>
            <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              AI Likelihood
            </span>
          </div>
        </div>
      </div>

      {/* Verdict Label */}
      <h2 className={`text-base font-bold tracking-tight ${accentColor} mb-1`}>
        {statusLabel}
      </h2>
      
      <p className="text-[11px] text-slate-400">
        Based on 6 calibrated statistical stylometry metrics
      </p>
    </div>
  );
}
