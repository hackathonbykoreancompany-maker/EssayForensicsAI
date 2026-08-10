"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface DetectedSignalsProps {
  score: ScoringResult;
}

interface SignalDisplay {
  title: string;
  description: string;
  severity: "high" | "moderate";
}

/**
 * Maps backend flag strings to user-facing signal display objects.
 */
const FLAG_MAP: Record<string, SignalDisplay> = {
  "Low sentence length variance": {
    title: "Low sentence-length variation",
    description: "Sentence lengths are more consistent than expected for natural writing.",
    severity: "high",
  },
  "Below-average sentence length variance": {
    title: "Below-average length variation",
    description: "Sentence lengths show less variation than typical human writing.",
    severity: "moderate",
  },
  "Suspiciously uniform sentence rhythm": {
    title: "Uniform sentence rhythm",
    description: "The passage follows a highly regular rhythm pattern across sentences.",
    severity: "high",
  },
  "Below-average sentence rhythm variation": {
    title: "Low rhythm variation",
    description: "Sentence cadence shows less variation than expected.",
    severity: "moderate",
  },
  "Suspiciously uniform sentence complexity": {
    title: "Uniform sentence complexity",
    description: "Sentence structural complexity is unusually consistent throughout.",
    severity: "high",
  },
  "Below-average sentence complexity variation": {
    title: "Low complexity variation",
    description: "Sentence structures show limited variation in complexity.",
    severity: "moderate",
  },
  "Low sentence burstiness": {
    title: "Low sentence burstiness",
    description: "Sentence lengths lack the irregular bursts typical of human writing.",
    severity: "high",
  },
  "Below-average sentence burstiness": {
    title: "Below-average burstiness",
    description: "The passage shows less irregular variation than expected.",
    severity: "moderate",
  },
  "Unusually high lexical diversity (AI pattern)": {
    title: "Elevated vocabulary diversity",
    description: "The vocabulary is more systematically varied than typical human writing.",
    severity: "high",
  },
  "Elevated lexical diversity": {
    title: "Moderately elevated vocabulary",
    description: "Vocabulary diversity is above average for this passage length.",
    severity: "moderate",
  },
};

export default function DetectedSignals({ score }: DetectedSignalsProps) {
  const signals = score.flags
    .map((flag) => FLAG_MAP[flag])
    .filter(Boolean)
    .slice(0, 3);

  if (signals.length === 0) {
    return (
      <div className="rounded-2xl glass-panel p-5 shadow-xl">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Detected Signals
        </h3>
        <p className="text-sm text-slate-400 italic">
          No strong individual signals were detected in this passage.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-4">
        Detected Signals
      </h3>

      <div className="space-y-3">
        {signals.map((signal, i) => (
          <div
            key={i}
            className="flex gap-4 items-start p-3.5 rounded-xl glass-panel-subtle"
          >
            {/* Number */}
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 text-[13px] font-bold font-mono">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-[13px] font-semibold text-white">
                  {signal.title}
                </h4>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    signal.severity === "high"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                  title={signal.severity === "high" ? "Strong signal" : "Moderate signal"}
                />
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed">
                {signal.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
