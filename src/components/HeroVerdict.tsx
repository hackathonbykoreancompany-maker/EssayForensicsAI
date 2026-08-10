"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface HeroVerdictProps {
  score: ScoringResult;
}

export default function HeroVerdict({ score }: HeroVerdictProps) {
  // Same classification thresholds as original OverviewSummary
  let statusLabel = "Likely Human";
  let accentColor = "text-emerald-400";
  let ringColor = "rgb(16, 185, 129)"; // emerald-500
  let glowClass = "shadow-emerald-500/10";
  let bgTint = "from-emerald-950/20 to-transparent";

  if (score.overallScore >= 60) {
    statusLabel = "Potentially AI-like";
    accentColor = "text-rose-400";
    ringColor = "rgb(244, 63, 94)"; // rose-500
    glowClass = "shadow-rose-500/10";
    bgTint = "from-rose-950/20 to-transparent";
  } else if (score.overallScore >= 30) {
    statusLabel = "Uncertain";
    accentColor = "text-amber-400";
    ringColor = "rgb(245, 158, 11)"; // amber-500
    glowClass = "shadow-amber-500/10";
    bgTint = "from-amber-950/20 to-transparent";
  }

  // Confidence badge
  const confidenceLabel = `${score.confidence.charAt(0).toUpperCase() + score.confidence.slice(1)} Evidence Strength`;
  const confidenceStyles: Record<string, string> = {
    low: "bg-slate-800/80 text-slate-400 border-slate-700/60",
    medium: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40",
    high: "bg-violet-950/60 text-violet-300 border-violet-800/40",
  };

  return (
    /* Fix 4: reduced padding from p-8 to p-5 */
    <div className={`rounded-2xl glass-panel bg-gradient-to-br ${bgTint} p-5 shadow-xl ${glowClass} text-center`}>
      {/* Section label */}
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
        Analysis Result
      </p>

      {/* Score Ring (Fix 4: scaled ring size to 135px) */}
      <div className="flex justify-center mb-4">
        <div
          className="score-ring !w-[135px] !h-[135px]"
          style={{
            "--ring-color": ringColor,
            "--ring-track": "rgba(30, 41, 59, 0.4)",
            "--score-progress": score.overallScore,
          } as React.CSSProperties}
        >
          <div className="score-ring-inner !w-[110px] !h-[110px] bg-slate-950/90 backdrop-blur-md">
            <span className={`text-[34px] font-extrabold tracking-tight leading-none ${accentColor}`}>
              {score.overallScore}%
            </span>
            <span className="text-[9px] font-semibold text-slate-400 mt-1 tracking-wide uppercase">
              AI Likelihood
            </span>
          </div>
        </div>
      </div>

      {/* Verdict Label */}
      <h2 className={`text-lg font-bold tracking-tight ${accentColor} mb-2`}>
        {statusLabel}
      </h2>

      {/* Confidence Badge */}
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${confidenceStyles[score.confidence]}`}>
        {confidenceLabel}
      </span>
    </div>
  );
}
