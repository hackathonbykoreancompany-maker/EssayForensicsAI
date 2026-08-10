/**
 * sentenceLength.ts
 *
 * Splits text into sentences and measures their word counts.
 * Returns per-sentence lengths plus summary statistics.
 */

export interface SentenceLengthResult {
  /** Word count for each sentence, in order */
  lengths: number[];
  /** Arithmetic mean of sentence lengths */
  mean: number;
  /** Shortest sentence (word count) */
  min: number;
  /** Longest sentence (word count) */
  max: number;
  /** Standard deviation of sentence lengths */
  stdDev: number;
}

/**
 * Splits a block of text into individual sentences.
 * Handles '.', '!', and '?' as terminators.
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Counts the number of words in a sentence.
 */
function countWords(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Analyzes sentence lengths across the entire essay text.
 *
 * @param text - The raw essay text to analyze
 * @returns SentenceLengthResult with per-sentence lengths and summary stats
 */
export function analyzeSentenceLengths(text: string): SentenceLengthResult {
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return { lengths: [], mean: 0, min: 0, max: 0, stdDev: 0 };
  }

  const lengths = sentences.map(countWords);

  const mean = lengths.reduce((sum, n) => sum + n, 0) / lengths.length;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);

  const variance =
    lengths.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) /
    lengths.length;
  const stdDev = Math.sqrt(variance);

  return {
    lengths,
    mean: parseFloat(mean.toFixed(2)),
    min,
    max,
    stdDev: parseFloat(stdDev.toFixed(2)),
  };
}
