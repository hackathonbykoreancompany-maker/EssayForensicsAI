/**
 * essayAnalysisService.ts
 *
 * Orchestrates all signal analysers and scoringService to return
 * raw signal metrics alongside calculated AI probability scoring.
 */

import {
  analyzeSentenceLengths,
  type SentenceLengthResult,
} from "./signals/sentenceLength";

import {
  analyzeSentenceRhythm,
  type SentenceRhythmResult,
} from "./signals/sentenceRhythm";

import {
  analyzeRepetition,
  type RepetitionResult,
} from "./signals/repetition";

import {
  calculateScore,
  type ScoringResult,
} from "./scoringService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EssayAnalysisResult {
  /** Total character count of the submitted text */
  characterCount: number;
  /** Total word count of the submitted text */
  wordCount: number;
  /** Sentence length metrics (mean, min, max, stdDev) */
  sentenceLength: SentenceLengthResult;
  /** Rhythm profile — how varied sentence lengths are */
  sentenceRhythm: SentenceRhythmResult;
  /** Repeated words, bigrams, and trigrams */
  repetition: RepetitionResult;
  /** Combined AI likelihood score and breakdown from scoringService */
  score: ScoringResult;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs all signal analysers on the provided essay text, computes scoring
 * via scoringService, and returns a unified EssayAnalysisResult.
 *
 * @param text - Raw essay text submitted by the user
 * @returns EssayAnalysisResult containing raw signals and scoring result
 */
export function analyzeEssay(text: string): EssayAnalysisResult {
  const safeText = typeof text === "string" ? text : "";

  // 1. Run the three signal analyzers
  const sentenceLength = analyzeSentenceLengths(safeText);
  const sentenceRhythm = analyzeSentenceRhythm(sentenceLength.lengths);
  const repetition = analyzeRepetition(safeText);

  // 2. Pass raw signal results to scoringService
  const score = calculateScore({
    sentenceLength,
    sentenceRhythm,
    repetition,
  });

  // 3. Return both raw analysis and scoring result
  return {
    characterCount: safeText.length,
    wordCount: countWords(safeText),
    sentenceLength,
    sentenceRhythm,
    repetition,
    score,
  };
}
