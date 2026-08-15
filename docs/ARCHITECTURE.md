# EssayForensics AI — System Architecture

This document describes the technical architecture of EssayForensics AI, covering the data flow from user input through signal analysis to the final scored result.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│   page.tsx (React 19 / Next.js 16 — "use client")           │
│   ├── EssayInput.tsx         Text editor + submit            │
│   ├── ForensicLoadingState   Branded 3s transition           │
│   ├── AnalysisResult.tsx     Score ring + signal breakdown   │
│   ├── SentenceInspector.tsx  Per-sentence highlighting       │
│   ├── AdvancedAnalysis.tsx   Detailed signal metrics         │
│   ├── DetectedSignals.tsx    Flag badges                     │
│   ├── WhyThisResult.tsx      Plain-language explanation      │
│   └── MethodologyModal.tsx   Methodology reference           │
│                                                              │
│   POST /api/analyze  { text: string }                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server (Next.js API Route)                │
│                                                              │
│   route.ts  (src/app/api/analyze/)                           │
│   ├── Rate limiter (10 req/min per IP, sliding window)       │
│   ├── Input validation (JSON, text field, length ≤ 50k)      │
│   └── Calls: analyzeEssay(text)                              │
│                                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              essayAnalysisService.ts  (Orchestrator)          │
│                                                              │
│   1. Runs 6 signal analyzers in parallel:                    │
│      ├── sentenceLength.ts     → SentenceLengthResult        │
│      ├── sentenceRhythm.ts     → SentenceRhythmResult        │
│      ├── repetition.ts         → RepetitionResult            │
│      ├── burstiness.ts         → BurstinessResult            │
│      ├── lexicalDiversity.ts   → LexicalDiversityResult      │
│      └── sentenceComplexity.ts → SentenceComplexityResult    │
│                                                              │
│   2. Passes all signal results to:                           │
│      └── scoringService.ts  → ScoringResult                  │
│          (weighted score + flags + confidence)                │
│                                                              │
│   3. Builds per-sentence classification from passage signals  │
│                                                              │
│   4. Returns: EssayAnalysisResult                            │
│      { characterCount, wordCount, all signals, score,        │
│        sentences[] with classification + evidence }           │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Map

### API Layer

| File | Purpose |
|------|---------|
| `src/app/api/analyze/route.ts` | POST endpoint. Rate limiting, input validation, delegates to `analyzeEssay()`. |

### Service Layer

| File | Purpose |
|------|---------|
| `src/services/essayAnalysisService.ts` | Orchestrator. Runs all signal analyzers, invokes scoring, builds per-sentence results. |
| `src/services/scoringService.ts` | **Core scoring engine.** Applies calibrated thresholds to signal metrics, computes weighted 0–100 score. |

### Signal Analyzers (`src/services/signals/`)

| File | Signal | Output Key Metric |
|------|--------|-------------------|
| `sentenceLength.ts` | Sentence length distribution | `stdDev` |
| `sentenceRhythm.ts` | Rhythm uniformity via length buckets | `coefficientOfVariation` |
| `sentenceComplexity.ts` | Punctuation-based clause complexity | `complexityCV` |
| `burstiness.ts` | Fano factor of sentence lengths | `score` |
| `lexicalDiversity.ts` | Moving-Average Type-Token Ratio | `mattr` |
| `repetition.ts` | Overused words + trigram repetition | `overusedWords`, `repeatedTrigrams` |

### UI Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `Hero.tsx` | Landing header with project branding |
| `EssayInput.tsx` | Rich textarea editor with character/word counters |
| `ForensicLoadingState.tsx` | Branded loading animation during analysis |
| `AnalysisResult.tsx` | Main result view: score ring + verdict + signal bars |
| `HeroVerdict.tsx` | Large verdict badge (AI-like / Human / Uncertain) |
| `DetectedSignals.tsx` | Flagged signal badges |
| `SentenceInspector.tsx` | Interactive sentence-by-sentence explorer |
| `SentenceHighlighter.tsx` | Color-coded sentence rendering |
| `AdvancedAnalysis.tsx` | Detailed signal metric cards |
| `WhyThisResult.tsx` | Plain-language explanation of the result |
| `MethodologyModal.tsx` | Slide-over modal explaining methodology |
| `SidebarNav.tsx` | Navigation sidebar with system telemetry |
| `Navbar.tsx` | Top navigation bar |
| `AnalysisEmptyStateVisual.tsx` | Visual placeholder before analysis |

### Data

| File | Purpose |
|------|---------|
| `src/data/referenceStats.json` | Pre-computed corpus statistics (mean, stdDev) for AI and Human distributions across all 6 signals. Derived from the 29,145-essay dataset. |
| `data/essays.csv` | Full labeled evaluation dataset (29,145 rows: `text,generated`). |
| `data/sample_100.csv` | 100-row sample for quick testing. |

---

## Data Flow

### 1. Input Validation
- JSON body parsing with error handling
- `text` field: must be a non-empty string, max 50,000 characters
- Rate limiting: 10 requests per minute per IP (sliding window, in-memory)

### 2. Signal Analysis
All 6 analyzers process the text independently. Each returns a typed result object with raw metrics.

### 3. Scoring
`scoringService.ts` applies calibrated step-function thresholds to each signal metric:
- Compares raw values against empirically-derived cutoffs
- Assigns points per signal (0, partial, or full)
- Sums to a raw score out of 100
- Determines confidence level based on sample size and score magnitude

### 4. Per-Sentence Classification
`essayAnalysisService.ts` maps passage-level signal flags back onto individual sentences to generate `ai-like` / `uncertain` / `human` classifications. No new detection logic is introduced at this step.

### 5. Response
A unified `EssayAnalysisResult` JSON object containing:
- Basic text stats (character count, word count)
- All 6 raw signal results
- Scoring result (overall score, confidence, breakdown, flags)
- Per-sentence results with classification and evidence

---

## Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `evaluateDataset.ts` | Full dataset evaluation: streams `data/essays.csv`, runs all analyses, prints accuracy/F1/confusion matrix. |
| `computeStats.ts` | Computes reference corpus statistics (μ, σ) from the dataset. |
| `findMisclassified.ts` | Finds high-confidence misclassifications for error analysis. |
| `recomputeThresholds.ts` | Verifies FP/FN rates at multiple score thresholds. |
| `runSingleEval.ts` | Evaluates a single essay from the dataset. |
| `testOneEssay.ts` | Runs analysis on a hardcoded test essay. |
| `get3Failures.ts` | Extracts representative failure cases for documentation. |
| `testRows842and787.ts` | Tests specific known false-positive cases. |
