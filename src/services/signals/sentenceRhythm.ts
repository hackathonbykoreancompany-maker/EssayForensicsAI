/**
 * sentenceRhythm.ts
 *
 * Measures how much sentence length varies across the essay.
 * Human writing typically shows high variation (mix of short punchy
 * sentences and long ones). AI writing tends to stay in a narrow band.
 */

export interface SentenceRhythmResult {
  /** Coefficient of Variation: stdDev / mean — higher = more varied rhythm */
  coefficientOfVariation: number;
  /** Raw sequence of sentence-length buckets, useful for visual rendering */
  pattern: SentenceLengthBucket[];
  /** True when rhythm looks unusually uniform (low variation) */
  isUniformRhythm: boolean;
}

/** Broad label for a sentence's length */
export type SentenceLengthBucket = "short" | "medium" | "long";

/** Thresholds for bucket classification (word counts) */
const SHORT_MAX = 10;
const LONG_MIN = 25;

/** Coefficient of Variation below this is considered suspiciously uniform */
const LOW_VARIATION_THRESHOLD = 0.25;

/**
 * Classifies a word count into a length bucket.
 */
function toBucket(wordCount: number): SentenceLengthBucket {
  if (wordCount <= SHORT_MAX) return "short";
  if (wordCount >= LONG_MIN) return "long";
  return "medium";
}

/**
 * Analyzes the rhythm (length variation) of sentences in an essay.
 *
 * @param lengths - Array of per-sentence word counts (from analyzeSentenceLengths)
 * @returns SentenceRhythmResult describing the rhythm profile
 */
export function analyzeSentenceRhythm(
  lengths: number[]
): SentenceRhythmResult {
  if (lengths.length === 0) {
    return {
      coefficientOfVariation: 0,
      pattern: [],
      isUniformRhythm: false,
    };
  }

  const mean = lengths.reduce((sum, n) => sum + n, 0) / lengths.length;

  const stdDev = Math.sqrt(
    lengths.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / lengths.length
  );

  // Avoid division by zero for single-word-count corpora
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  const pattern = lengths.map(toBucket);

  const isUniformRhythm =
    lengths.length >= 3 &&
    coefficientOfVariation < LOW_VARIATION_THRESHOLD;

  return {
    coefficientOfVariation: parseFloat(coefficientOfVariation.toFixed(4)),
    pattern,
    isUniformRhythm,
  };
}
