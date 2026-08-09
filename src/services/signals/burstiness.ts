/**
 * burstiness.ts
 *
 * Measures how irregular or "bursty" the sentence length pattern is.
 *
 * Human writing tends to alternate between short punchy sentences and
 * long expository ones, producing high burstiness. AI-generated text
 * tends to stay in a narrow length band, producing low burstiness.
 *
 * Metric: Fano factor (variance / mean of sentence word-counts),
 * normalised to [0, 1) via tanh(fano / 20).
 *
 * ---------------------------------------------------------------------------
 * Calibration evidence (29 145-row labelled dataset):
 *   AI    mean=0.176  p50=0.114  p90=0.407
 *   Human mean=0.267  p50=0.219  p90=0.506
 *   Cohen's d = 0.541  (MEDIUM separation)
 * ---------------------------------------------------------------------------
 */

export interface BurstinessResult {
  /**
   * Normalised Fano factor in [0, 1).
   * Higher = more bursty = more human-like variation.
   * AI text: typically < 0.15 at median.
   * Human text: typically > 0.22 at median.
   */
  score: number;
  /** Raw Fano factor (variance / mean) before normalisation */
  fanoFactor: number;
  /** Whether the text is flagged as suspiciously low-burstiness */
  isLowBurstiness: boolean;
  /** Number of sentences analysed */
  sentenceCount: number;
}

// ---------------------------------------------------------------------------
// Calibrated thresholds (from dataset percentile analysis)
// ---------------------------------------------------------------------------

/**
 * Normalised score below this → flagged as low-burstiness (AI-like).
 * Chosen at AI p75 (0.217) — flags the bottom 75% of AI distribution
 * while limiting false positives on human text.
 */
const LOW_BURSTINESS_THRESHOLD = 0.20;

/** Minimum sentences required for a meaningful burstiness measurement */
const MIN_SENTENCES = 3;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Measures sentence-length burstiness from a pre-computed lengths array.
 * Accepts the lengths[] array from SentenceLengthResult to avoid
 * re-parsing the text.
 *
 * @param lengths - Per-sentence word counts (from analyzeSentenceLengths)
 * @returns BurstinessResult with normalised score and flag
 */
export function analyzeBurstiness(lengths: number[]): BurstinessResult {
  if (lengths.length < MIN_SENTENCES) {
    return {
      score: 0,
      fanoFactor: 0,
      isLowBurstiness: false,
      sentenceCount: lengths.length,
    };
  }

  const mean =
    lengths.reduce((sum, n) => sum + n, 0) / lengths.length;

  if (mean === 0) {
    return {
      score: 0,
      fanoFactor: 0,
      isLowBurstiness: false,
      sentenceCount: lengths.length,
    };
  }

  const variance =
    lengths.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) /
    lengths.length;

  const fanoFactor = variance / mean;

  // Normalise to [0, 1) — tanh asymptotes at 1, so score is always bounded
  const score = parseFloat(Math.tanh(fanoFactor / 20).toFixed(4));

  return {
    score,
    fanoFactor: parseFloat(fanoFactor.toFixed(4)),
    isLowBurstiness: score < LOW_BURSTINESS_THRESHOLD,
    sentenceCount: lengths.length,
  };
}
