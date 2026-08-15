<p align="center">
  <img src="public/forensics_bg.png" width="120" alt="EssayForensics AI" />
</p>

<h1 align="center">EssayForensics AI</h1>

<p align="center">
  <strong>Evidence-based statistical stylometry for detecting AI-generated writing patterns</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> · 
  <a href="#how-it-works">How It Works</a> · 
  <a href="#evaluation-results">Evaluation</a> · 
  <a href="#limitations">Limitations</a> · 
  <a href="docs/">Documentation</a>
</p>

---

## What Is This?

EssayForensics AI is a **fully client-side, zero-API-key** AI writing pattern detector that analyzes essays using statistical stylometry — the quantitative study of linguistic style. It examines measurable structural features of writing (sentence length variance, rhythm uniformity, vocabulary richness, syntactic complexity, and burstiness) and compares them against patterns calibrated from a 29,145-essay labeled corpus.

**It does not use an LLM, neural network, or any external API for detection.** All analysis runs as deterministic TypeScript on the server, producing explainable, reproducible results.

### Key Features

| Feature | Description |
|---------|-------------|
| **6 Stylometric Signals** | Sentence length variance, rhythm CV, syntactic complexity, burstiness (Fano factor), lexical diversity (MATTR), and repetition analysis |
| **Explainable Results** | Every score is backed by specific, visible signal breakdowns — not a black-box probability |
| **Per-Sentence Highlighting** | Interactive sentence-level classification showing which sentences contribute to the overall verdict |
| **Calibrated on 29,145 Essays** | Thresholds derived from PERSUADE 2.0 (human) + multi-model LLM-generated essays (GPT-3.5/4, Claude, LLaMA, Mistral, PaLM) |
| **Zero Dependencies on External AI** | No OpenAI key, no cloud API, no model inference — pure statistical computation |
| **Rate-Limited API** | In-memory sliding-window rate limiter (10 req/min per IP) |

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/EssayForensicsAI.git
cd EssayForensicsAI
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — paste any essay and click **"Analyze Essay"**.

### Production Build

```bash
npm run build
npm start
```

---

## How It Works

### Architecture

```
User pastes essay text
       │
       ▼
POST /api/analyze  ──►  essayAnalysisService.ts  (orchestrator)
                               │
           ┌───────────────────┼───────────────────────┐
           │                   │                       │
   sentenceLength.ts    sentenceRhythm.ts    sentenceComplexity.ts
   burstiness.ts        lexicalDiversity.ts  repetition.ts
           │                   │                       │
           └───────────────────┼───────────────────────┘
                               │
                    scoringService.ts  (weighted scoring engine)
                               │
                               ▼
                    JSON response with score,
                    breakdown, flags, per-sentence results
```

### Signal Descriptions

| Signal | What It Measures | AI Indicator | Weight |
|--------|-----------------|--------------|--------|
| **Syntactic Complexity CV** | Variation in punctuation-based sentence complexity | Low CV = uniform = AI-like | 30 pts |
| **Burstiness (Fano Factor)** | How "bursty" sentence length patterns are | Low burstiness = AI-like | 20 pts |
| **Lexical Diversity (MATTR)** | Vocabulary richness via moving-average type-token ratio | *High* MATTR = AI-like (inverted) | 20 pts |
| **Sentence Length Variance** | Standard deviation of word counts per sentence | Low variance = AI-like | 15 pts |
| **Sentence Rhythm CV** | Coefficient of variation across sentence length buckets | Low CV = AI-like | 15 pts |
| **Repetition** | Overused words and repeated trigrams | Excluded from scoring (inverted signal) | 0 pts |

> **Total: 100 points.** Score ≥ 50 = predicted AI. The strongest signal (complexity CV, Cohen's d = 0.939) gets the highest weight.

See **[docs/METHODOLOGY.md](docs/METHODOLOGY.md)** for the full scoring engine deep-dive.

---

## Evaluation Results

Evaluated against the full 29,145-essay labeled dataset at the default threshold (score ≥ 50):

| Metric | Value |
|--------|-------|
| **Accuracy** | **73.95%** (21,555 / 29,145) |
| **Precision** | 62.0% |
| **Recall** | 75.1% |
| **F1 Score** | 67.9% |

### Confusion Matrix

|  | Predicted AI | Predicted Human |
|--|-------------|----------------|
| **Actual AI** | 8,736 (TP) | 2,901 (FN) |
| **Actual Human** | 5,353 (FP) | 12,155 (TN) |

See **[docs/EVALUATION.md](docs/EVALUATION.md)** for full score distributions and per-signal analysis.

---

## Limitations

> [!IMPORTANT]
> **This tool provides statistical pattern analysis, not definitive proof of AI authorship.** Results should be used as one data point among many in any evaluation process.

1. **Formulaic human writing triggers false positives.** Rigid template essays (5-paragraph format, uniform sentence structures) score as AI-like because they statistically resemble AI output.
2. **Structured AI output evades detection.** AI-generated text with letter headers, address blocks, or intentional structural variety scores as human-like because it inflates variance metrics.
3. **Domain-specific limitation.** Calibrated only on middle/high school argumentative essays. Untested on STEM writing, creative fiction, legal text, or non-English content.
4. **No ESL bias data available.** The evaluation corpus lacks native-language metadata, so ESL bias cannot be confirmed or ruled out.
5. **Not adversarially hardened.** The system has not been tested against prompt-engineered evasion or paraphrasing tools.

See **[docs/LIMITATIONS.md](docs/LIMITATIONS.md)** and **[docs/BIAS_CHECK.md](docs/BIAS_CHECK.md)** for full analysis.

---

## Project Structure

```
EssayForensicsAI/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts    # POST endpoint with rate limiting
│   │   ├── page.tsx                # Main UI (workspace + result overlay)
│   │   ├── layout.tsx              # Root layout with SEO metadata
│   │   └── globals.css             # Design system + animations
│   ├── components/                 # 14 React components (Hero, AnalysisResult, etc.)
│   ├── services/
│   │   ├── essayAnalysisService.ts # Orchestrator: runs all signals + scoring
│   │   ├── scoringService.ts       # Weighted scoring engine (core logic)
│   │   └── signals/               # 6 individual signal analyzers
│   └── data/
│       └── referenceStats.json     # Pre-computed corpus statistics (μ, σ)
├── scripts/
│   ├── evaluateDataset.ts          # Full dataset evaluation runner
│   ├── computeStats.ts             # Corpus statistics computation
│   └── ...                         # Additional evaluation utilities
├── data/
│   ├── essays.csv                  # 29,145-row labeled evaluation dataset
│   └── README.md                   # Dataset format documentation
├── docs/                           # Research documentation
│   ├── METHODOLOGY.md              # Scoring engine deep-dive
│   ├── EVALUATION.md               # Accuracy metrics & confusion matrix
│   ├── DATASET.md                  # Dataset provenance & composition
│   ├── ARCHITECTURE.md             # System architecture overview
│   ├── WRONG_ANSWERS.md            # Error analysis: misclassification case studies
│   ├── BIAS_CHECK.md               # ESL / non-native bias audit
│   └── LIMITATIONS.md              # Known constraints & failure modes
└── package.json
```

---

## Running the Dataset Evaluator

To reproduce evaluation metrics against the full 29,145-essay dataset:

```bash
# Default threshold (50)
npm run evaluate

# Custom threshold
npm run evaluate -- --threshold 60
```

The evaluator streams `data/essays.csv`, runs `analyzeEssay()` on every row, and prints a full evaluation report including accuracy, precision, recall, F1, confusion matrix, and per-signal distributions.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: TypeScript 5
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + custom CSS design system
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- **Runtime**: Server-side API route (Node.js) — no client-side computation for analysis

---

## License

This project was built for a hackathon. See dataset documentation for data provenance and licensing details.

---

<p align="center">
  <sub>Built by <strong>ANK</strong> · Statistical Stylometry & Authorship Intelligence</sub>
</p>
