/**
 * repetition.ts
 *
 * Detects overused words and repeated n-gram phrases in an essay.
 * AI-generated text often repeats filler phrases and transitional
 * expressions at higher rates than human writing.
 */

/** A single word or phrase that appears more than once */
export interface RepeatedTerm {
  term: string;
  count: number;
  /** Frequency as a ratio of total tokens */
  frequency: number;
}

export interface RepetitionResult {
  /** Top overused single words (excluding stop words) */
  overusedWords: RepeatedTerm[];
  /** Repeated 2-word phrases (bigrams) */
  repeatedBigrams: RepeatedTerm[];
  /** Repeated 3-word phrases (trigrams) */
  repeatedTrigrams: RepeatedTerm[];
  /** Total unique content words analysed */
  uniqueWordCount: number;
}

// ----- helpers ---------------------------------------------------------------

/** Common words to exclude from word-level repetition analysis */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "this", "that",
  "these", "those", "it", "its", "they", "them", "their", "we", "our",
  "you", "your", "he", "she", "his", "her", "i", "my", "me", "not",
  "as", "if", "so", "than", "then", "also", "just", "more", "very",
]);

/** Minimum count for a term to be reported as overused */
const MIN_OCCURRENCES = 2;

/**
 * Normalises text into a lowercase token array, stripping punctuation.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Builds a frequency map from an array of tokens or n-grams.
 */
function buildFrequencyMap(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
}

/**
 * Converts a frequency map into a sorted RepeatedTerm array.
 */
function toSortedTerms(
  map: Map<string, number>,
  total: number,
  minCount = MIN_OCCURRENCES
): RepeatedTerm[] {
  return Array.from(map.entries())
    .filter(([, count]) => count >= minCount)
    .map(([term, count]) => ({
      term,
      count,
      frequency: parseFloat((count / total).toFixed(4)),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generates n-grams from a token array.
 */
function buildNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}

// ----- public API ------------------------------------------------------------

/**
 * Analyses word and phrase repetition in an essay.
 *
 * @param text - The raw essay text to analyse
 * @returns RepetitionResult with overused words, bigrams, and trigrams
 */
export function analyzeRepetition(text: string): RepetitionResult {
  const allTokens = tokenize(text);
  const totalTokens = allTokens.length;

  if (totalTokens === 0) {
    return {
      overusedWords: [],
      repeatedBigrams: [],
      repeatedTrigrams: [],
      uniqueWordCount: 0,
    };
  }

  // Word-level: exclude stop words
  const contentTokens = allTokens.filter((t) => !STOP_WORDS.has(t));
  const wordFreq = buildFrequencyMap(contentTokens);
  const overusedWords = toSortedTerms(wordFreq, totalTokens);

  // N-gram analysis uses all tokens (stop words add context to phrases)
  const bigrams = buildNgrams(allTokens, 2);
  const trigrams = buildNgrams(allTokens, 3);

  const repeatedBigrams = toSortedTerms(
    buildFrequencyMap(bigrams),
    bigrams.length
  );
  const repeatedTrigrams = toSortedTerms(
    buildFrequencyMap(trigrams),
    trigrams.length
  );

  return {
    overusedWords,
    repeatedBigrams,
    repeatedTrigrams,
    uniqueWordCount: wordFreq.size,
  };
}
