/**
 * sentenceComplexity.ts
 *
 * Measures variation in sentence structural complexity using punctuation
 * density as a proxy. Each sentence's complexity is estimated by its
 * comma + semicolon count per word. The Coefficient of Variation (CV)
 * of these densities across all sentences captures how uniformly complex
 * the writing is.
 *
 * Human writing varies considerably in complexity — some sentences are
 * simple, others heavily subordinated with multiple clauses. AI-generated
 * text tends to apply a uniform complexity level throughout.
 *
 * ---------------------------------------------------------------------------
 * Calibration evidence (29 145-row labelled dataset):
 *   AI    mean=0.960  p50=0.897  p90=1.421
 *   Human mean=1.539  p50=1.345  p90=2.553
 *   Cohen's d = 0.939  (LARGE separation — strongest new signal)
 * ---------------------------------------------------------------------------
 */

export interface SentenceComplexityResult {
  /**
   * Coefficient of Variation of per-sentence punctuation density.
   * Higher = more varied complexity = more human-like.
   * AI median ≈ 0.90, Human median ≈ 1.35.
   */
  complexityCV: number;
  /**
   * Mean punctuation density across sentences
   * (commas + semicolons per word).
   */
  meanDensity: number;
  /**
   * Whether the CV is in the low range associated with AI text
   * (uniformly structured sentences).
   */
  isUniformComplexity: boolean;
  /** Number of sentences that contributed to the measurement */
  sentenceCount: number;
}

// ---------------------------------------------------------------------------
// Calibrated thresholds
// ---------------------------------------------------------------------------

/**
 * CV below this → flagged as uniformly complex (AI-like).
 * Chosen between AI p75 (1.145) and Human p25 (1.006) — a conservative
 * threshold that catches the clear AI tail without over-flagging humans.
 */
const LOW_CV_THRESHOLD = 1.00;

/** Minimum sentences needed for a meaningful CV measurement */
const MIN_SENTENCES = 3;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Measures sentence complexity variation from individual sentence strings.
 *
 * @param sentences - Array of sentence strings (from splitIntoSentences)
 * @returns SentenceComplexityResult with CV and flag
 */
export function analyzeSentenceComplexity(
  sentences: string[]
): SentenceComplexityResult {
  if (sentences.length < MIN_SENTENCES) {
    return {
      complexityCV: 0,
      meanDensity: 0,
      isUniformComplexity: false,
      sentenceCount: sentences.length,
    };
  }

  const densities: number[] = [];

  for (const s of sentences) {
    const words = s.split(/\s+/).filter((w) => w.length > 0).length;
    if (words === 0) continue;
    const puncts = (s.match(/[,;]/g) ?? []).length;
    densities.push(puncts / words);
  }

  if (densities.length < MIN_SENTENCES) {
    return {
      complexityCV: 0,
      meanDensity: 0,
      isUniformComplexity: false,
      sentenceCount: sentences.length,
    };
  }

  const mean =
    densities.reduce((sum, d) => sum + d, 0) / densities.length;

  // If mean is 0 (no punctuation at all), CV is undefined — not informative
  if (mean === 0) {
    return {
      complexityCV: 0,
      meanDensity: 0,
      isUniformComplexity: false,
      sentenceCount: sentences.length,
    };
  }

  const stdDev = Math.sqrt(
    densities.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
      densities.length
  );

  const cv = stdDev / mean;

  return {
    complexityCV: parseFloat(cv.toFixed(4)),
    meanDensity: parseFloat(mean.toFixed(4)),
    isUniformComplexity: cv < LOW_CV_THRESHOLD,
    sentenceCount: sentences.length,
  };
}
