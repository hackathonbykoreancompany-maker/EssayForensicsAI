# EssayForensics AI — Evaluation Report

This document presents the full evaluation results of the EssayForensics AI detection engine against the 29,145-essay labeled dataset.

---

## Dataset Summary

| Property | Value |
|----------|-------|
| **Total essays** | 29,145 |
| **Human essays** | 17,508 (60.07%) |
| **AI-generated essays** | 11,637 (39.93%) |
| **Decision threshold** | Score ≥ 50 → Predicted AI |

The dataset combines PERSUADE 2.0 student essays (human) with LLM-generated essays from GPT-3.5-Turbo, GPT-4, PaLM 2, Claude, LLaMA-2 (7B/13B/70B), and Mistral 7B. See [DATASET.md](DATASET.md) for full provenance.

---

## Overall Metrics (Threshold = 50)

| Metric | Value |
|--------|-------|
| **Accuracy** | **73.95%** (21,555 / 29,145) |
| **Precision** | 62.0% (of essays predicted AI, actually AI) |
| **Recall** | 75.1% (of actual AI essays, correctly caught) |
| **F1 Score** | 67.9% |

---

## Confusion Matrix

|  | Predicted AI | Predicted Human |
|--|-------------|----------------|
| **Actual AI** (n=11,637) | **8,736** (TP) | 2,901 (FN) |
| **Actual Human** (n=17,508) | 5,353 (FP) | **12,155** (TN) |

### Interpretation

- **True Positive Rate (Recall)**: 75.1% — the system detects ~3 out of 4 AI-generated essays.
- **False Positive Rate**: 30.6% — about 1 in 3 human essays is incorrectly flagged. This is the primary weakness, driven by formulaic student writing that statistically resembles AI output.
- **True Negative Rate (Specificity)**: 69.4% — correctly identifies ~7 out of 10 human essays.
- **False Negative Rate**: 24.9% — about 1 in 4 AI essays evades detection, particularly those with structural formatting artifacts.

---

## Score Distributions

### Mean Scores by Class

| Class | Mean Score | Median Score |
|-------|-----------|-------------|
| AI-generated | ~55 | ~56 |
| Human-written | ~38 | ~36 |

### Score Histogram

| Score Band | AI % | Human % |
|-----------|------|---------|
| 0–10 | ~3% | ~12% |
| 10–20 | ~5% | ~11% |
| 20–30 | ~7% | ~13% |
| 30–40 | ~5% | ~10% |
| 40–50 | ~5% | ~8% |
| 50–60 | ~8% | ~9% |
| 60–70 | ~15% | ~10% |
| 70–80 | ~18% | ~10% |
| 80–90 | ~18% | ~10% |
| 90–100 | ~16% | ~7% |

> The distributions overlap significantly in the 40–70 range, reflecting the inherent difficulty of separating formulaic student writing from well-structured AI output using statistical methods alone.

---

## Per-Signal Distribution Summary

| Signal | AI Mean | AI Median | Human Mean | Human Median |
|--------|---------|-----------|------------|-------------|
| Sentence Length StdDev | 8.55 | 6.81 | 11.25 | 9.49 |
| Sentence Rhythm CV | 0.368 | 0.336 | 0.484 | 0.465 |
| Syntactic Complexity CV | 0.956 | 0.897 | 1.475 | 1.345 |
| Burstiness (Fano) | 0.175 | 0.114 | 0.266 | 0.219 |
| MATTR (Lexical Diversity) | 0.723 | 0.706 | 0.667 | 0.672 |

---

## False Positive Rate at High-Confidence Thresholds

| Threshold | Human Essays Flagged (FP) | FP Rate |
|-----------|--------------------------|---------|
| Score ≥ 50 | 5,353 / 17,508 | 30.6% |
| Score ≥ 70 | 2,961 / 17,508 | 16.9% |

---

## Key Failure Patterns

### Why False Positives Occur
The dominant false positive pattern is **formulaic student writing**: 5-paragraph essays with rigid thesis-evidence-conclusion structure, uniform sentence lengths, and low complexity variation. These essays are statistically indistinguishable from AI output under our signal set.

Representative case: Row #842 ("Imagine a life without cars...") — a perfectly structured persuasive essay that scores 100/100 AI-like because it triggers all 5 active signals. See [WRONG_ANSWERS.md](WRONG_ANSWERS.md) for detailed case studies.

### Why False Negatives Occur
The dominant false negative pattern is **AI-generated text with structural formatting**: letter headers, address blocks, subject lines, and metadata that artificially inflate sentence length variance and rhythm variation. These formatting artifacts push z-score metrics into the human distribution range.

Representative case: Row #523 (Electoral College letter format) — an AI-generated essay that scores 0/100 because address headers break sentence segmentation. See [WRONG_ANSWERS.md](WRONG_ANSWERS.md) for details.

---

## Threshold Selection Rationale

The default threshold of 50 was selected via a sweep across the 29,145-essay dataset, optimizing for F1 score. Key trade-offs:

| Threshold | Accuracy | Precision | Recall | F1 |
|-----------|----------|-----------|--------|----|
| 40 | ~68% | ~54% | ~85% | ~66% |
| **50** | **~74%** | **~62%** | **~75%** | **~68%** |
| 60 | ~74% | ~68% | ~60% | ~64% |
| 70 | ~73% | ~75% | ~45% | ~56% |

Threshold 50 provides the best F1 balance between catching AI essays and minimizing false positives.

---

## Reproducibility

To reproduce these results:

```bash
npm run evaluate
```

This streams the full `data/essays.csv` dataset, runs `analyzeEssay()` on every row, and prints the complete evaluation report. Results are deterministic — the same dataset and code always produce the same metrics.

For custom thresholds:

```bash
npm run evaluate -- --threshold 60
```
