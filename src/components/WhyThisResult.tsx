"use client";

import React from "react";
import type { ScoringResult } from "../services/scoringService";

interface WhyThisResultProps {
  score: ScoringResult;
}

const FLAG_TO_PHRASE: Record<string, string> = {
  "Low sentence length variance": "unusually consistent sentence lengths",
  "Below-average sentence length variance": "relatively low variation in sentence length",
  "Suspiciously uniform sentence rhythm": "a highly regular sentence rhythm pattern",
  "Below-average sentence rhythm variation": "below-average rhythm variation across sentences",
  "Suspiciously uniform sentence complexity": "uniformly structured syntactic complexity",
  "Below-average sentence complexity variation": "limited structural variation in sentence syntax",
  "Low sentence burstiness": "minimal variation in sentence cadence",
  "Below-average sentence burstiness": "below-average sentence burstiness",
  "Unusually high lexical diversity (AI pattern)": "a systematically elevated vocabulary distribution",
  "Elevated lexical diversity": "elevated vocabulary diversity across the passage",
};

function buildExplanation(flags: string[], overallScore: number): string {
  if (flags.length === 0 && overallScore < 30) {
    return "The passage demonstrates natural structural variation in sentence length, rhythm, and vocabulary distribution — patterns characteristic of human composition.";
  }

  if (flags.length === 0) {
    return "No individual signals were strongly triggered, but composite stylometric measurements produced a moderate likelihood value.";
  }

  const phrases = flags
    .map((f) => FLAG_TO_PHRASE[f])
    .filter(Boolean)
    .slice(0, 3);

  if (phrases.length === 0) {
    return "Multiple subtle stylometric indicators in this text contributed to the overall signal assessment.";
  }

  if (phrases.length === 1) {
    return `The document exhibits ${phrases[0]}. This statistical marker contributed to the overall likelihood score.`;
  }

  const last = phrases.pop()!;
  return `The document exhibits ${phrases.join(", ")} alongside ${last}. These statistical markers contributed to the overall likelihood score.`;
}

export default function WhyThisResult({ score }: WhyThisResultProps) {
  const explanation = buildExplanation(score.flags, score.overallScore);

  return (
    <div className="surface-card rounded-2xl p-5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
          Analysis Summary
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed pl-7">
        {explanation}
      </p>
    </div>
  );
}
