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

const FLAG_MAP: Record<string, SignalDisplay> = {
  "Low sentence length variance": {
    title: "Low Sentence-Length Variance",
    description: "Sentence lengths are more uniformly clustered than expected in natural writing.",
    severity: "high",
  },
  "Below-average sentence length variance": {
    title: "Below-Average Length Variance",
    description: "Sentence length variation is moderately lower than standard human corpora.",
    severity: "moderate",
  },
  "Suspiciously uniform sentence rhythm": {
    title: "Uniform Sentence Rhythm (Low CV)",
    description: "The text follows an unnaturally repetitive cadence across consecutive sentences.",
    severity: "high",
  },
  "Below-average sentence rhythm variation": {
    title: "Low Rhythm Variation",
    description: "Sentence cadence demonstrates lower standard variation than average human writing.",
    severity: "moderate",
  },
  "Suspiciously uniform sentence complexity": {
    title: "Uniform Syntactic Complexity",
    description: "Sentence structural depth and punctuation patterns are unusually uniform.",
    severity: "high",
  },
  "Below-average sentence complexity variation": {
    title: "Low Syntactic Variation",
    description: "Sentence structures show narrow variation in complexity markers.",
    severity: "moderate",
  },
  "Low sentence burstiness": {
    title: "Low Sentence Burstiness (Fano Factor)",
    description: "The document lacks the natural bursty clustering typical of human discourse.",
    severity: "high",
  },
  "Below-average sentence burstiness": {
    title: "Below-Average Burstiness",
    description: "Sentence length transitions display reduced irregularity across the passage.",
    severity: "moderate",
  },
  "Unusually high lexical diversity (AI pattern)": {
    title: "Elevated Lexical Diversity (MATTR)",
    description: "Vocabulary distribution is systematically elevated beyond standard student corpora.",
    severity: "high",
  },
  "Elevated lexical diversity": {
    title: "Moderately High Lexical Diversity",
    description: "Moving-average type-token ratio is above average for this passage length.",
    severity: "moderate",
  },
};

export default function DetectedSignals({ score }: DetectedSignalsProps) {
  const signals = score.flags
    .map((flag) => FLAG_MAP[flag])
    .filter(Boolean)
    .slice(0, 3);

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="surface-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Primary Stylometric Indicators
        </h3>
        <span className="text-[10px] text-stone-400 font-mono">
          {signals.length} {signals.length === 1 ? "marker" : "markers"} active
        </span>
      </div>

      <div className="space-y-2.5">
        {signals.map((signal, i) => (
          <div
            key={i}
            className="flex gap-3.5 items-start p-3 rounded-xl surface-subtle"
          >
            {/* Number Pill */}
            <span className="flex-shrink-0 w-6 h-6 rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 text-[11px] font-bold font-mono">
              {i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="text-xs font-semibold text-stone-100">
                  {signal.title}
                </h4>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                    signal.severity === "high"
                      ? "bg-red-950/70 text-red-300 border border-red-800/60"
                      : "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                  }`}
                >
                  {signal.severity === "high" ? "High Confidence" : "Moderate Marker"}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {signal.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
