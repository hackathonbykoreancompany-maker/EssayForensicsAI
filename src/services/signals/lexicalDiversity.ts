/**
 * lexicalDiversity.ts
 *
 * Measures vocabulary richness using the Moving-Average Type-Token Ratio
 * (MATTR), which is robust to text length unlike simple TTR.
 *
 * IMPORTANT — counterintuitive finding from dataset calibration:
 *   AI text in this dataset scores HIGHER on MATTR than human text.
 *   This reflects the deliberately varied vocabulary in long AI-generated
 *   essays. The scoring logic therefore treats high MATTR as an AI signal.
 *
 * ---------------------------------------------------------------------------
 * Calibration evidence (29 145-row labelled dataset):
 *   AI    mean=0.724  p50=0.706  p90=0.887
 *   Human mean=0.667  p50=0.672  p90=0.736
 *   Cohen's d = 0.639  (MEDIUM separation, direction: AI HIGHER)
 * ---------------------------------------------------------------------------
 */

export interface LexicalDiversityResult {
  /**
   * MATTR score in [0, 1].
   * Counter-intuitively, AI text scores HIGHER in this dataset
   * (structured essays with deliberately varied vocabulary).
   * AI median ≈ 0.706, Human median ≈ 0.672.
   */
  mattr: number;
  /**
   * Whether the MATTR is in the high range associated with AI text
   * in this dataset (score > 0.70).
   */
  isHighMattr: boolean;
  /** Number of tokens analysed */
  tokenCount: number;
  /** Window size used for MATTR calculation */
  windowSize: number;
}

// ---------------------------------------------------------------------------
// Calibrated thresholds
// ---------------------------------------------------------------------------

/** Window size for MATTR sliding window */
const MATTR_WINDOW = 100;

/**
 * MATTR above this is associated with AI text in this dataset.
 * Chosen at the midpoint between AI p50 (0.706) and Human p75 (0.708)
 * — a conservative threshold that avoids flagging typical human text.
 */
const HIGH_MATTR_THRESHOLD = 0.72;

/** Minimum tokens needed for a meaningful MATTR measurement */
const MIN_TOKENS = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Computes the Moving-Average Type-Token Ratio (MATTR) for the text.
 *
 * MATTR slides a window of `windowSize` tokens across the text and
 * averages the Type-Token Ratio (unique/total) at each position.
 * This makes it length-independent, unlike simple TTR.
 *
 * @param text - Raw essay text
 * @returns LexicalDiversityResult with MATTR score and flag
 */
export function analyzeLexicalDiversity(text: string): LexicalDiversityResult {
  const tokens = tokenize(text);

  if (tokens.length < MIN_TOKENS) {
    return {
      mattr: 0,
      isHighMattr: false,
      tokenCount: tokens.length,
      windowSize: MATTR_WINDOW,
    };
  }

  let mattrScore: number;

  if (tokens.length < MATTR_WINDOW) {
    // Text shorter than window: fall back to simple TTR
    mattrScore = new Set(tokens).size / tokens.length;
  } else {
    // Sliding window average
    const windowCount = tokens.length - MATTR_WINDOW + 1;
    let sum = 0;
    for (let i = 0; i < windowCount; i++) {
      const window = tokens.slice(i, i + MATTR_WINDOW);
      sum += new Set(window).size / MATTR_WINDOW;
    }
    mattrScore = sum / windowCount;
  }

  const mattr = parseFloat(mattrScore.toFixed(4));

  return {
    mattr,
    isHighMattr: mattr > HIGH_MATTR_THRESHOLD,
    tokenCount: tokens.length,
    windowSize: MATTR_WINDOW,
  };
}
