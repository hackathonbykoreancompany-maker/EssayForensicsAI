# EssayForensics AI — Scoring Methodology

This document describes the statistical scoring engine that powers EssayForensics AI, explaining each signal, how thresholds were derived, and how the final score is calculated.

---

## Overview

The detection engine uses **6 stylometric signals** — quantitative features of writing style that can be computed without any machine learning model. Each signal measures a specific structural property of the text and contributes a weighted score to the overall AI likelihood assessment.

The signals were selected based on **Cohen's d effect size** analysis across the 29,145-essay labeled dataset:

| Signal | Cohen's d | Direction | Weight (Max Points) |
|--------|-----------|-----------|---------------------|
| Syntactic Complexity CV | **0.939** (Large) | AI = Lower | 30 pts |
| Lexical Diversity MATTR | **0.639** (Medium) | AI = **Higher** (inverted) | 20 pts |
| Burstiness (Fano Factor) | **0.541** (Medium) | AI = Lower | 20 pts |
| Sentence Length StdDev | **~0.45** (Medium) | AI = Lower | 15 pts |
| Sentence Rhythm CV | **~0.40** (Medium) | AI = Lower | 15 pts |
| Repetition (bigram diversity) | **0.197** (Negligible) | — | 0 pts (excluded) |

> **Total maximum raw score: 100 points.** The signal with the strongest separation power (syntactic complexity CV, d = 0.939) receives the highest weight allocation.

---

## Signal Descriptions

### 1. Syntactic Complexity CV (30 points)

**What it measures**: The coefficient of variation (CV) of punctuation-based sentence complexity scores across all sentences in the essay.

**How it works**: Each sentence receives a complexity score based on clause-signaling punctuation (commas, semicolons, colons, parentheses, dashes). The CV across all sentence scores measures how much structural complexity *varies* from sentence to sentence.

**AI pattern**: AI-generated text tends to produce sentences with **uniformly similar complexity** (low CV). Human writers naturally produce more varied sentence structures — some simple, some complex.

**Thresholds (calibrated)**:
- `complexityCV < 1.00` → **30 pts** ("Suspiciously uniform sentence complexity")
- `complexityCV < 1.35` → **18 pts** ("Below-average sentence complexity variation")

**Corpus statistics**: AI median = 0.897, Human median = 1.345

---

### 2. Burstiness — Fano Factor (20 points)

**What it measures**: The Fano factor of sentence lengths — ratio of variance to mean in the sentence word count distribution.

**How it works**: Computes `variance(lengths) / mean(lengths)`. Higher values indicate more "bursty" length patterns (alternating between very short and very long sentences), which is characteristic of natural human writing.

**AI pattern**: AI-generated text produces **evenly spaced sentence lengths** with low burstiness.

**Thresholds (calibrated)**:
- `burstiness < 0.14` → **20 pts** ("Low sentence burstiness")
- `burstiness < 0.22` → **12 pts** ("Below-average sentence burstiness")

**Corpus statistics**: AI median = 0.114, Human median = 0.219

---

### 3. Lexical Diversity — MATTR (20 points)

**What it measures**: Moving-Average Type-Token Ratio — vocabulary richness measured over a sliding window.

**How it works**: Computes type-token ratio (unique words / total words) using a moving window across the text, then averages all windows. This corrects for the text-length bias inherent in basic TTR.

**AI pattern**: AI-generated text tends to have **higher** MATTR than human writing in this dataset. This is a counter-intuitive *inverted* signal — AI uses a wider vocabulary range more consistently.

**Thresholds (calibrated)**:
- `mattr > 0.72` → **20 pts** ("Unusually high lexical diversity — AI pattern")
- `mattr > 0.68` → **12 pts** ("Elevated lexical diversity")

**Corpus statistics**: AI median = 0.706, Human median = 0.672

---

### 4. Sentence Length Variance (15 points)

**What it measures**: Standard deviation of word counts across sentences.

**How it works**: Splits text into sentences, counts words in each, and computes the standard deviation of the distribution.

**AI pattern**: AI-generated text tends to produce sentences of **similar length** (low standard deviation). Human writing naturally varies more — mixing short punchy sentences with long complex ones.

**Thresholds (calibrated)**:
- `stdDev < 7` → **15 pts** ("Low sentence length variance")
- `stdDev < 9` → **9 pts** ("Below-average sentence length variance")

**Corpus statistics**: AI median = 6.81 words, Human median = 9.49 words

---

### 5. Sentence Rhythm CV (15 points)

**What it measures**: Coefficient of variation of the sentence length bucket distribution (short/medium/long classification).

**How it works**: Classifies each sentence into length buckets (short, medium, long) and measures how varied the sequence is using the coefficient of variation.

**AI pattern**: AI-generated text tends to produce **uniform rhythm** — predominantly medium-length sentences. Human writing has more rhythmic variety.

**Thresholds (calibrated)**:
- `cv < 0.30` → **15 pts** ("Suspiciously uniform sentence rhythm")
- `cv < 0.40` → **9 pts** ("Below-average sentence rhythm variation")

**Corpus statistics**: AI median = 0.336, Human median = 0.465

---

### 6. Repetition (0 points — Excluded)

**What it measures**: Overused words and repeated trigrams.

**Why excluded**: Empirical testing showed both `overusedWords` and `repeatedTrigrams` have an **inverted** effect on this dataset — human student essays show *more* repetition than AI-generated text. Including this signal would increase false positives.

The signal is still computed and included in the API response for informational purposes but contributes 0 points to the overall score.

---

## Score Calculation

### Raw Score

```
rawScore = sentenceLengthScore + sentenceRhythmScore + sentenceComplexityScore
         + burstinessScore + lexicalDiversityScore + repetitionScore(=0)
```

### Normalization

```
overallScore = clamp(round((rawScore / 100) * 100), 0, 100)
```

Since `MAX_RAW_SCORE = 100`, the raw score maps directly to the 0–100 scale.

### Decision Threshold

| Overall Score | Classification |
|--------------|----------------|
| **≥ 50** | Predicted **AI** |
| **< 50** | Predicted **Human** |

The threshold of 50 was selected via a sweep across the 29,145-essay dataset, optimizing for F1 score after adding the burstiness, lexical diversity, and sentence complexity signals.

### Confidence Level

| Condition | Confidence |
|-----------|-----------|
| Fewer than 3 sentences | `low` |
| ≥ 6 sentences AND score > 60 or < 20 | `high` |
| Otherwise | `medium` |

---

## Per-Sentence Classification

Individual sentences are classified as `ai-like`, `uncertain`, or `human` based on existing passage-level signals mapped back to the sentence level:

1. **Medium-length sentence + passage-level rhythm flagged** → +2 AI signals
2. **Passage-level length variance flagged** → +1 AI signal
3. **Sentence contains overused words from passage analysis** → +1 AI signal
4. **Short or long sentence** → -1 AI signal (breaks rhythm uniformity)

Classification: ≥ 3 signals = `ai-like`, ≥ 1 = `uncertain`, 0 = `human`

> **Important**: Per-sentence classification is derived entirely from passage-level signals. No new detection algorithm is introduced at the sentence level.

---

## What This Is Not

- **Not a neural classifier.** There is no trained model, no embeddings, no perplexity scoring.
- **Not watermark detection.** This does not detect any specific AI watermarking scheme.
- **Not adversarially robust.** Simple paraphrasing or style transfer could evade detection.
- **Not evidence of academic misconduct.** Statistical patterns are not proof of authorship.
