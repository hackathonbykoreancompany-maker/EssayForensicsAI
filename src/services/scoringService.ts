/**
 * scoringService.ts
 *
 * Evaluates raw signal metrics to produce an overall AI probability score,
 * confidence level, signal breakdown, and flagged indicators.
 *
 * ---------------------------------------------------------------------------
 * CALIBRATION NOTES  (calibrated against 29 145-row labelled dataset,
 *                      11 637 AI / 17 508 Human)
 * ---------------------------------------------------------------------------
 *
 * Signal probe results (Cohen's d — effect size for AI/Human separation):
 *
 *   sentenceComplexity.complexityCV   d=0.939  LARGE   AI lower
 *   lexicalDiversity.mattr            d=0.639  MEDIUM  AI HIGHER (inverted)
 *   burstiness.score                  d=0.541  MEDIUM  AI lower
 *   sentenceLength.stdDev             d~0.45   MEDIUM  AI lower
 *   sentenceRhythm.cv                 d~0.40   MEDIUM  AI lower
 *   bigramDiversity                   d=0.197  NEGLGBL excluded from scoring
 *   overusedWords / repeatedTrigrams  INVERTED excluded from scoring
 *
 * Weight allocation (max raw = 100):
 *   sentenceComplexityScore : up to 30 pts  (strongest signal)
 *   burstinessScore         : up to 20 pts
 *   lexicalDiversityScore   : up to 20 pts  (inverted: high MATTR = AI)
 *   sentenceLengthScore     : up to 15 pts
 *   sentenceRhythmScore     : up to 15 pts
 *   repetitionScore         : 0 pts  (kept for API contract)
 *
 * Decision threshold: 50 (calibrated via sweep after adding new signals)
 * ---------------------------------------------------------------------------
 */

import type { SentenceLengthResult }    from "./signals/sentenceLength";
import type { SentenceRhythmResult }    from "./signals/sentenceRhythm";
import type { RepetitionResult }        from "./signals/repetition";
import type { BurstinessResult }        from "./signals/burstiness";
import type { LexicalDiversityResult }  from "./signals/lexicalDiversity";
import type { SentenceComplexityResult } from "./signals/sentenceComplexity";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignalScores {
  sentenceLengthScore: number;
  sentenceRhythmScore: number;
  /** Always 0 — kept for API contract compatibility */
  repetitionScore: number;
  sentenceComplexityScore: number;
  burstinessScore: number;
  lexicalDiversityScore: number;
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
  sentenceLength:     SentenceLengthResult;
  sentenceRhythm:     SentenceRhythmResult;
  repetition:         RepetitionResult;
  burstiness:         BurstinessResult;
  lexicalDiversity:   LexicalDiversityResult;
  sentenceComplexity: SentenceComplexityResult;
}

// ---------------------------------------------------------------------------
// Calibrated constants
// ---------------------------------------------------------------------------

/** Sum of maximum scores for all active signals */
const MAX_RAW_SCORE = 100;

// ---------------------------------------------------------------------------
// calculateScore
// ---------------------------------------------------------------------------

/**
 * Calculates an overall AI probability score from combined signal metrics.
 * All thresholds are calibrated against the 29 145-row labelled dataset.
 */
export function calculateScore(input: ScoringInput): ScoringResult {
  const flags: string[] = [];
  const sampleSize = input.sentenceLength.lengths.length;
  const hasSample  = sampleSize >= 3;

  // ── 1. Sentence length stdDev ──────────────────────────────────────────
  // AI median=6.81, Human median=9.49. (Medium separation d~0.45)
  let sentenceLengthScore = 0;
  if (hasSample) {
    if (input.sentenceLength.stdDev < 7) {
      sentenceLengthScore = 10;
      flags.push("Low sentence length variance");
    } else if (input.sentenceLength.stdDev < 9) {
      sentenceLengthScore = 6;
      flags.push("Below-average sentence length variance");
    }
  }

  // ── 2. Rhythm CV ──────────────────────────────────────────────────────
  // AI median=0.336, Human median=0.465. (Medium separation d~0.40)
  let sentenceRhythmScore = 0;
  const cv = input.sentenceRhythm.coefficientOfVariation;
  if (hasSample) {
    if (cv < 0.30) {
      sentenceRhythmScore = 15;
      flags.push("Suspiciously uniform sentence rhythm");
    } else if (cv < 0.40) {
      sentenceRhythmScore = 9;
      flags.push("Below-average sentence rhythm variation");
    }
  }

  // ── 3. Repetition (disabled) ──────────────────────────────────────────
  // Both overusedWords and repeatedTrigrams are inverted on this dataset.
  const repetitionScore = 0;

  // ── 4. Sentence complexity CV (strongest signal, d=0.939) ─────────────
  // AI median=0.897, Human median=1.345. Lower CV = more uniform = AI-like.
  let sentenceComplexityScore = 0;
  if (hasSample && input.sentenceComplexity.complexityCV > 0) {
    if (input.sentenceComplexity.complexityCV < 1.00) {
      sentenceComplexityScore = 40;
      flags.push("Suspiciously uniform sentence complexity");
    } else if (input.sentenceComplexity.complexityCV < 1.35) {
      sentenceComplexityScore = 24;
      flags.push("Below-average sentence complexity variation");
    }
  }

  // ── 5. Burstiness (d=0.541) ───────────────────────────────────────────
  // AI median=0.114, Human median=0.219. Lower burstiness = AI-like.
  let burstinessScore = 0;
  if (hasSample && input.burstiness.score > 0) {
    if (input.burstiness.score < 0.14) {
      burstinessScore = 15;
      flags.push("Low sentence burstiness");
    } else if (input.burstiness.score < 0.22) {
      burstinessScore = 9;
      flags.push("Below-average sentence burstiness");
    }
  }

  // ── 6. Lexical diversity MATTR (d=0.639, inverted) ────────────────────
  // AI median=0.706, Human median=0.672. Higher MATTR = AI in this dataset.
  let lexicalDiversityScore = 0;
  if (input.lexicalDiversity.mattr > 0) {
    if (input.lexicalDiversity.mattr > 0.72) {
      lexicalDiversityScore = 20;
      flags.push("Unusually high lexical diversity (AI pattern)");
    } else if (input.lexicalDiversity.mattr > 0.68) {
      lexicalDiversityScore = 12;
      flags.push("Elevated lexical diversity");
    }
  }

  // ── Normalise to 0–100 ────────────────────────────────────────────────
  const rawScore =
    sentenceLengthScore +
    sentenceRhythmScore +
    sentenceComplexityScore +
    burstinessScore +
    lexicalDiversityScore;

  const overallScore = Math.min(
    100,
    Math.round((rawScore / MAX_RAW_SCORE) * 100)
  );

  // ── Confidence ────────────────────────────────────────────────────────
  let confidence: "low" | "medium" | "high" = "medium";
  if (sampleSize < 3) {
    confidence = "low";
  } else if (sampleSize >= 6 && (overallScore > 60 || overallScore < 20)) {
    confidence = "high";
  }

  return {
    overallScore,
    confidence,
    breakdown: {
      sentenceLengthScore,
      sentenceRhythmScore,
      repetitionScore,
      sentenceComplexityScore,
      burstinessScore,
      lexicalDiversityScore,
    },
    flags,
  };
}
