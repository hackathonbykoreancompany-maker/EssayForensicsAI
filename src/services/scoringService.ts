/**
 * scoringService.ts
 *
 * Evaluates raw signal metrics to produce an overall AI probability score,
 * confidence level, signal breakdown, and flagged indicators.
 */

import type { SentenceLengthResult } from "./signals/sentenceLength";
import type { SentenceRhythmResult } from "./signals/sentenceRhythm";
import type { RepetitionResult } from "./signals/repetition";

export interface SignalScores {
  sentenceLengthScore: number;
  sentenceRhythmScore: number;
  repetitionScore: number;
}

export interface ScoringResult {
  /** Overall AI likelihood score from 0 to 100 */
  overallScore: number;
  /** Assessment confidence based on sample size and signal strength */
  confidence: "low" | "medium" | "high";
  /** Breakdown of individual signal contributions */
  breakdown: SignalScores;
  /** Human-readable flags triggered during analysis */
  flags: string[];
}

export interface ScoringInput {
  sentenceLength: SentenceLengthResult;
  sentenceRhythm: SentenceRhythmResult;
  repetition: RepetitionResult;
}

/**
 * Calculates an overall AI probability score from combined signal metrics.
 */
export function calculateScore(input: ScoringInput): ScoringResult {
  const flags: string[] = [];
  let lengthScore = 0;
  let rhythmScore = 0;
  let repetitionScore = 0;

  // 1. Sentence length variance check
  if (input.sentenceLength.lengths.length >= 3) {
    if (input.sentenceLength.stdDev < 4) {
      lengthScore += 30;
      flags.push("Very low sentence length variance");
    } else if (input.sentenceLength.stdDev < 6) {
      lengthScore += 15;
    }
  }

  // 2. Rhythm uniformity check
  if (input.sentenceRhythm.isUniformRhythm) {
    rhythmScore += 35;
    flags.push("Suspiciously uniform sentence rhythm");
  }

  // 3. Repetition checks
  if (input.repetition.overusedWords.length >= 3) {
    repetitionScore += 20;
    flags.push("Overused content words detected");
  }
  if (input.repetition.repeatedTrigrams.length >= 1) {
    repetitionScore += 15;
    flags.push("Repeated 3-word phrases detected");
  }

  const overallScore = Math.min(
    100,
    Math.round(lengthScore + rhythmScore + repetitionScore)
  );

  const sampleSize = input.sentenceLength.lengths.length;
  let confidence: "low" | "medium" | "high" = "medium";
  if (sampleSize < 3) {
    confidence = "low";
  } else if (sampleSize >= 6 && (overallScore > 65 || overallScore < 25)) {
    confidence = "high";
  }

  return {
    overallScore,
    confidence,
    breakdown: {
      sentenceLengthScore: lengthScore,
      sentenceRhythmScore: rhythmScore,
      repetitionScore,
    },
    flags,
  };
}
