# EssayForensics AI

> Evidence-based statistical stylometry and authorship intelligence for detecting AI-generated writing patterns.

![EssayForensics AI UI Workspace](public/app_screenshot.png)

**Live Demo:** [https://essay-forensics-ai.vercel.app](https://essay-forensics-ai.vercel.app)

---

## How It Works

1. **Paste Essay:** Input student essays or academic manuscripts into the secure workspace.
2. **Analyze:** Run zero-API deterministic statistical stylometry across 6 core linguistic metrics.
3. **Sentence-Level Verdict:** Get immediate, transparent classification with highlighted sentence-level evidence and score breakdowns.

*EssayForensics AI is not a LLM or chatbot wrapper — it runs pure deterministic statistical calculations to deliver fully explainable and reproducible stylometric metrics.*

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.app) / Netlify

---

## Stylometric Signals

EssayForensics AI evaluates text using 6 core stylometric signals calibrated against a 29,145-essay corpus:

- **Sentence Length Variance:** Standard deviation of word counts per sentence.
- **Sentence Rhythm CV:** Coefficient of variation across sentence length buckets.
- **MATTR Lexical Richness:** Moving-Average Type-Token Ratio for vocabulary diversity.
- **Burstiness (Fano Factor):** Dispersion of sentence lengths measuring rhythm variations.
- **Syntactic Complexity:** Structural punctuation and clause complexity variations.
- **Repetition:** Overused words and repeated trigrams analysis.

---

## Honest Accuracy

Evaluated against a benchmark dataset of 29,145 essays:

- **78.1%** overall accuracy (22,762 / 29,145)
- **7.64%** high-confidence false positive rate on human essays
- **1.25%** high-confidence false negative rate on AI essays

*Note: We tested and reverted two alternative scoring approaches (logistic regression and decision tree classification) after empirical benchmarking showed they degraded explainability without significant accuracy gains.*

---

## Documentation

For full research details, dataset composition, error case studies, and bias audits, see:

- [docs/DATASET.md](docs/DATASET.md) — Dataset provenance and 29,145-essay evaluation corpus composition.
- [docs/WRONG_ANSWERS.md](docs/WRONG_ANSWERS.md) — Detailed misclassification case studies and error mode breakdown.
- [docs/BIAS_CHECK.md](docs/BIAS_CHECK.md) — ESL and non-native speaker bias evaluation audit.

---

## Setup & Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/EssayForensicsAI.git
cd EssayForensicsAI

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

> **Positioning:** EssayForensics AI provides evidence-based statistical stylometric analysis, not proof of AI authorship. Results serve as quantitative diagnostic metrics to assist human review.
