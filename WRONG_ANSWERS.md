# EssayForensics AI — Confident Misclassifications Report (`WRONG_ANSWERS.md`)

This report analyzes high-confidence misclassifications produced by the detection engine on the 29,145-essay evaluation dataset, comparing the **previous fixed-cutoff scoring baseline** against the **new corpus z-score comparison logic**.

---

## Final Accuracy & High-Confidence Error Comparison

### Side-by-Side Performance Comparison

| Metric Category | Fixed-Cutoff Baseline | New Corpus Z-Score Logic | Effect of Z-Score Change |
| :--- | :---: | :---: | :--- |
| **Overall Dataset Accuracy** | **78.1%** (22,762 / 29,145) | **68.1%** (19,861 / 29,145) | Accuracy dropped by **10.0%** overall due to increased false positives. |
| **High-Confidence False Positives** ($\text{Score} \ge 70$, Human) | **7.64%** (1,338 / 17,508) | **15.55%** (2,723 / 17,508) | High-confidence FP rate **more than doubled (+7.91%)**. |
| **High-Confidence False Negatives** ($\text{Score} \le 20$, AI) | **1.25%** (145 / 11,637) | **0.64%** (74 / 11,637) | High-confidence FN rate **halved (-0.61%)**. |

> [!IMPORTANT]
> **Honest Assessment of Template-Essay False Positives**: The previously-identified human template false positives (e.g. Row #842 *"Imagine a life without cars..."* and Row #787 *"West Coast trip..."*) **are still scored at 100/100 (high-confidence AI-like)** under the z-score scorer. The reference corpus comparison step **did not fix** these formulaic human essays; because smoothly scaled z-score distances continuously accumulate points for low variance, human template writing falling into the lower tail of the human distribution is flagged even more aggressively.

---

## Confidently Misclassified Case Studies (Z-Score Scorer)

---

### Case 1: High-Confidence False Positive (Human Essay Scored as AI)

* **True Label**: `Human`
* **Assigned AI Score**: **100 / 100** (Confidence: `high`)
* **Dataset Row**: #842 (Topic: *Car-Free Cities*)

#### Text Excerpt
> *"Imagine a life without cars. All those paved roads completely empty with no traffic and no honking horns. Sounds like a peaceful community to me. Limiting cars could be a huge advantage to our world. Reducing these big pieces of metal flying all over our roads could help our environment, save tons of money, and improve our safety. Recently, I've heard..."*

#### Signal Breakdown
- **Sentence Complexity CV Score**: `30 / 30` (Flagged: *Suspiciously uniform sentence complexity (corpus z-score)*)
- **Sentence Burstiness Score**: `20 / 20` (Flagged: *Low sentence burstiness (corpus z-score)*)
- **Lexical Diversity (MATTR) Score**: `20 / 20` (Flagged: *Unusually high lexical diversity (corpus z-score)*)
- **Sentence Length Variance Score**: `15 / 15` (Flagged: *Low sentence length variance (corpus z-score)*)
- **Sentence Rhythm CV Score**: `15 / 15` (Flagged: *Suspiciously uniform sentence rhythm (corpus z-score)*)

#### Primary FP Technical Driver
Rigid template essay styling and formulaic sentence structures ("Limiting cars could be...", "Reducing these big pieces of metal could...") continuously yield z-score values far below the human mean ($\mu = 11.25$ length stdDev, $\mu = 1.47$ complexity CV), triggering max z-score points across all 5 active signals.

---

### Case 2: High-Confidence False Negative (AI Essay Scored as Human)

* **True Label**: `AI` (Generated via LLM as a formal letter to a senator)
* **Assigned AI Score**: **0 / 100** (Confidence: `high`)
* **Dataset Row**: #523 (Topic: *Electoral College*)

#### Text Excerpt
> `"Support for the Electoral College or Proposing a Change to Popular Vote for Presidential Elections"`  
> `"Dear Senator [Senator's Last Name],"`  
> `"I am writing to express my opinion regarding the Electoral College and to argue in favor of either keeping the current system or changing to a popular vote for the..."`

#### Signal Breakdown
- **Sentence Complexity CV Score**: `0 / 30`
- **Sentence Burstiness Score**: `0 / 20`
- **Lexical Diversity (MATTR) Score**: `0 / 20`
- **Sentence Length Variance Score**: `0 / 15`
- **Sentence Rhythm CV Score**: `0 / 15`

#### Primary FN Technical Driver
Structural placeholder metadata (address header blocks and subject lines) breaks sentence boundary segmentation into ultra-short single-word sentences intermixed with formal body paragraphs. This header noise artificially inflates sentence length variance and rhythm variation, pushing z-score metrics into the upper human distribution range and suppressing every AI signal score to 0.
