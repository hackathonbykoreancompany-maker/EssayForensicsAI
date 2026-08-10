"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface WhyThisResultProps {
  score: ScoringResult;
}

/**
 * Maps backend flag strings to plain-English phrases for the explanation.
 * Only the first matching phrase for each signal category is used.
 */
const FLAG_TO_PHRASE: Record<string, string> = {
  "Low sentence length variance": "unusually consistent sentence lengths",
  "Below-average sentence length variance": "relatively low variation in sentence length",
  "Suspiciously uniform sentence rhythm": "a highly regular sentence rhythm",
  "Below-average sentence rhythm variation": "below-average rhythm variation across sentences",
  "Suspiciously uniform sentence complexity": "uniformly structured sentence complexity",
  "Below-average sentence complexity variation": "limited variation in sentence complexity",
  "Low sentence burstiness": "minimal variation in sentence cadence",
  "Below-average sentence burstiness": "below-average sentence burstiness",
  "Unusually high lexical diversity (AI pattern)": "a systematically varied vocabulary pattern",
  "Elevated lexical diversity": "elevated vocabulary diversity across the passage",
};

function buildExplanation(flags: string[], overallScore: number): string {
  if (flags.length === 0 && overallScore < 30) {
    return "The passage shows natural variation in sentence structure, rhythm, and vocabulary — patterns typically associated with human writing.";
  }

  if (flags.length === 0) {
    return "No individual signals were strongly triggered, but the combination of measured patterns produced a moderate signal.";
  }

  const phrases = flags
    .map((f) => FLAG_TO_PHRASE[f])
    .filter(Boolean)
    .slice(0, 3);

  if (phrases.length === 0) {
    return "Several linguistic patterns in this passage contributed to the overall signal.";
  }

  if (phrases.length === 1) {
    return `The passage shows ${phrases[0]}. This pattern contributed to the overall likelihood signal.`;
  }

  const last = phrases.pop()!;
  return `The passage shows ${phrases.join(", ")} and ${last}. These patterns contributed to the overall likelihood signal.`;
}

export default function WhyThisResult({ score }: WhyThisResultProps) {
  const explanation = buildExplanation(score.flags, score.overallScore);

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Why this result?
      </h3>
      <p className="text-sm text-slate-200 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}
