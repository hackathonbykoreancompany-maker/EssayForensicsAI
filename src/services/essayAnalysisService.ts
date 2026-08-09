/**
 * essayAnalysisService.ts
 *
 * Orchestrates all signal analysers and scoringService to return
 * raw signal metrics alongside calculated AI probability scoring,
 * plus authoritative per-sentence classification for the frontend.
 */

import {
  analyzeSentenceLengths,
  type SentenceLengthResult,
} from "./signals/sentenceLength";

import {
  analyzeSentenceRhythm,
  type SentenceRhythmResult,
  type SentenceLengthBucket,
} from "./signals/sentenceRhythm";

import {
  analyzeRepetition,
  type RepetitionResult,
} from "./signals/repetition";

import {
  analyzeBurstiness,
  type BurstinessResult,
} from "./signals/burstiness";

import {
  analyzeLexicalDiversity,
  type LexicalDiversityResult,
} from "./signals/lexicalDiversity";

import {
  analyzeSentenceComplexity,
  type SentenceComplexityResult,
} from "./signals/sentenceComplexity";

import {
  calculateScore,
  type ScoringResult,
} from "./scoringService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Classification bucket for a single sentence */
export type SentenceClassification = "ai-like" | "uncertain" | "human";

/** Per-sentence analysis result derived from the existing signal data */
export interface SentenceResult {
  /** The original sentence text */
  sentence: string;
  /** Word count for this sentence */
  wordCount: number;
  /** Length bucket assigned by the rhythm analyzer */
  lengthBucket: SentenceLengthBucket;
  /** AI likelihood classification for this sentence */
  classification: SentenceClassification;
  /**
   * Evidence signals that influenced this sentence's classification.
   * Values are drawn entirely from the existing signal calculations —
   * no new detection logic is introduced here.
   */
  evidence: {
    /** Whether the passage-level rhythm is flagged as uniformly AI-like */
    passageRhythmFlagged: boolean;
    /** Whether the passage-level sentence length variance is flagged */
    passageLengthFlagged: boolean;
    /** Whether this sentence's word count falls in the "medium" band
     *  that contributes to uniform rhythm (between SHORT_MAX and LONG_MIN) */
    contributesToUniformRhythm: boolean;
    /** Overused words found in this specific sentence (subset of passage result) */
    overusedWordsInSentence: string[];
  };
}

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
  /** Sentence-length burstiness (Fano factor) */
  burstiness: BurstinessResult;
  /** Vocabulary richness via MATTR */
  lexicalDiversity: LexicalDiversityResult;
  /** Sentence structural complexity variation */
  sentenceComplexity: SentenceComplexityResult;
  /** Combined AI likelihood score and breakdown from scoringService */
  score: ScoringResult;
  /** Authoritative per-sentence classification results */
  sentences: SentenceResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Splits text into sentences using the same regex as sentenceLength.ts
 * so indices align perfectly with the lengths[] array.
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Normalises text into lowercase tokens for overused-word matching.
 * Mirrors the tokenizer in repetition.ts.
 */
function tokenizeSimple(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 1)
  );
}

/**
 * Classifies a single sentence into ai-like / uncertain / human.
 *
 * Classification is based entirely on signals already computed by the
 * existing analyzers — no new detection algorithm is introduced here.
 */
function classifySentence(
  wordCount: number,
  bucket: SentenceLengthBucket,
  passageRhythmFlagged: boolean,
  passageLengthFlagged: boolean,
  overusedWordsInSentence: string[]
): SentenceClassification {
  let aiSignals = 0;

  // Signal 1: sentence sits in the "medium" band typical of uniform-rhythm AI output
  if (bucket === "medium" && passageRhythmFlagged) aiSignals += 2;

  // Signal 2: passage-level length variance is suspiciously low
  if (passageLengthFlagged) aiSignals += 1;

  // Signal 3: sentence contains overused words flagged at passage level
  if (overusedWordsInSentence.length > 0) aiSignals += 1;

  // Signal 4: very short or very long sentences lean human (break rhythm uniformity)
  if (bucket === "short" || bucket === "long") aiSignals = Math.max(0, aiSignals - 1);

  if (aiSignals >= 3) return "ai-like";
  if (aiSignals >= 1) return "uncertain";
  return "human";
}

/**
 * Builds the per-sentence results array by mapping existing signal data
 * back onto individual sentences. No new signal logic is introduced.
 */
function buildSentenceResults(
  sentences: string[],
  lengths: number[],
  pattern: SentenceLengthBucket[],
  passageRhythmFlagged: boolean,
  passageLengthFlagged: boolean,
  overusedWordSet: Set<string>
): SentenceResult[] {
  return sentences.map((sentence, i) => {
    const wc = lengths[i] ?? countWords(sentence);
    const lengthBucket = pattern[i] ?? "medium";

    const sentenceTokens = tokenizeSimple(sentence);
    const overusedWordsInSentence = Array.from(overusedWordSet).filter((w) =>
      sentenceTokens.has(w)
    );

    const contributesToUniformRhythm =
      lengthBucket === "medium" && passageRhythmFlagged;

    const classification = classifySentence(
      wc,
      lengthBucket,
      passageRhythmFlagged,
      passageLengthFlagged,
      overusedWordsInSentence
    );

    return {
      sentence,
      wordCount: wc,
      lengthBucket,
      classification,
      evidence: {
        passageRhythmFlagged,
        passageLengthFlagged,
        contributesToUniformRhythm,
        overusedWordsInSentence,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs all signal analysers on the provided essay text, computes scoring
 * via scoringService, builds per-sentence classification, and returns a
 * unified EssayAnalysisResult.
 *
 * @param text - Raw essay text submitted by the user
 * @returns EssayAnalysisResult containing raw signals, scoring, and sentence results
 */
export function analyzeEssay(text: string): EssayAnalysisResult {
  const safeText = typeof text === "string" ? text : "";

  // 1. Run all signal analyzers
  const sentenceLength   = analyzeSentenceLengths(safeText);
  const sentenceRhythm   = analyzeSentenceRhythm(sentenceLength.lengths);
  const repetition       = analyzeRepetition(safeText);
  const burstiness       = analyzeBurstiness(sentenceLength.lengths);
  const lexicalDiversity = analyzeLexicalDiversity(safeText);

  // sentenceComplexity needs the split sentences (avoids re-splitting)
  const rawSentences     = splitIntoSentences(safeText);
  const sentenceComplexity = analyzeSentenceComplexity(rawSentences);

  // 2. Pass all signal results to scoringService
  const score = calculateScore({
    sentenceLength,
    sentenceRhythm,
    repetition,
    burstiness,
    lexicalDiversity,
    sentenceComplexity,
  });

  // 3. Derive passage-level flags for per-sentence classification
  const passageRhythmFlagged  = sentenceRhythm.isUniformRhythm;
  const passageLengthFlagged  =
    sentenceLength.stdDev < 6 && sentenceLength.lengths.length >= 3;

  // 4. Build per-sentence results
  const overusedWordSet = new Set(repetition.overusedWords.map((w) => w.term));
  const sentences = buildSentenceResults(
    rawSentences,
    sentenceLength.lengths,
    sentenceRhythm.pattern,
    passageRhythmFlagged,
    passageLengthFlagged,
    overusedWordSet
  );

  // 5. Return unified result
  return {
    characterCount: safeText.length,
    wordCount: countWords(safeText),
    sentenceLength,
    sentenceRhythm,
    repetition,
    burstiness,
    lexicalDiversity,
    sentenceComplexity,
    score,
    sentences,
  };
}
