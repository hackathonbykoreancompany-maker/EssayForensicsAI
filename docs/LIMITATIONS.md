# EssayForensics AI — Known Limitations

This document honestly describes the constraints, failure modes, and boundaries of the EssayForensics AI detection engine. **Understanding these limitations is essential for responsible use.**

---

## 1. This Is Pattern Analysis, Not Proof

> **EssayForensics AI provides statistical pattern analysis, not definitive evidence of AI authorship.**

The system detects whether an essay's structural properties (sentence variance, rhythm, complexity, vocabulary) fall into ranges statistically associated with AI-generated text in our calibration corpus. It cannot determine:
- Who actually wrote the text
- Whether AI was used as a starting point and then edited
- Whether a human deliberately wrote in a formulaic style

**Any score should be treated as one data point among many**, never as conclusive proof.

---

## 2. High False Positive Rate on Formulaic Writing

**Limitation**: Rigid, well-structured student essays trigger AI-like scores.

The system's largest weakness is a ~30.6% false positive rate at the default threshold (score ≥ 50). This is primarily caused by:
- **5-paragraph essay templates** with uniform sentence structures
- **Test-prep coached essays** that follow strict thesis-evidence-conclusion patterns
- **Skilled student writers** who naturally produce low-variance, high-vocabulary text

Example: Row #842 in the evaluation dataset — a perfectly structured persuasive essay about car-free cities — scores 100/100 AI-like because it triggers every active signal.

**Impact**: Using this tool as the sole basis for academic integrity decisions would unfairly flag strong student writers.

---

## 3. AI Text with Structural Formatting Evades Detection

**Limitation**: AI-generated text with letter headers, address blocks, or metadata is consistently misclassified as human.

The sentence segmentation algorithm splits text on `.!?` boundaries. When AI generates formal letters with:
```
[Your Name]
[Your Address]
[City, State, ZIP Code]
[Date]

[Senator's Name]
...
```

These header blocks create ultra-short "sentences" that artificially inflate length variance and rhythm variation, masking the AI signal.

**Impact**: AI-generated formal letters, emails, and structured documents may score 0/100.

---

## 4. Domain-Specific Calibration

**Limitation**: The system was calibrated exclusively on middle/high school argumentative essays.

The 29,145-essay dataset consists of:
- Persuasive and argumentative essays on standard topics
- Written by 6th–12th grade students (human) and various LLMs (AI)
- English-language only

The system is **currently untested and uncalibrated** for:

| Domain | Risk |
|--------|------|
| **STEM & Technical Writing** | Code documentation, math proofs, engineering papers |
| **Creative Writing & Fiction** | Short stories, poetry, narrative scripts |
| **Short-Form Text** | Social media posts, micro-blogs (< 100 words) |
| **Specialized Academic Literature** | Legal briefs, medical journals, doctoral dissertations |
| **Non-English Content** | Any language other than English |
| **Professional Business Writing** | Reports, proposals, marketing copy |

Using the system on these domains may produce unreliable results in either direction.

---

## 5. No ESL / Non-Native English Bias Data

**Limitation**: The evaluation corpus lacks metadata about writer native language or English proficiency level.

Because there are no L1/L2 labels, we cannot empirically measure whether ESL writers' essays are disproportionately flagged as AI-like. There is a theoretical concern that:
- Formulaic grammar structures in L2 writing could reduce complexity variance
- Restricted L2 vocabulary range could affect MATTR scores
- Repetitive sentence templates in learner writing could lower standard deviation metrics

See [BIAS_CHECK.md](BIAS_CHECK.md) for the full audit and requirements for future ESL bias testing.

---

## 6. Not Adversarially Hardened

**Limitation**: The system has not been tested against deliberate evasion strategies.

Possible evasion vectors include:
- **Paraphrasing tools** that intentionally vary sentence structure
- **Prompt engineering** that instructs AI to mimic human writing patterns
- **Post-processing** that adds intentional variance, typos, or stylistic irregularities
- **Human editing** of AI-generated first drafts

A motivated adversary could likely craft AI text that scores as human-like with minimal effort.

---

## 7. Binary Classification Is Reductive

**Limitation**: The human/AI binary does not capture the full spectrum of authorship.

Real-world writing often involves:
- **AI-assisted writing**: Human writes, AI suggests edits
- **AI-initiated, human-revised**: AI generates draft, human rewrites
- **Hybrid collaboration**: Multiple rounds of human-AI interaction
- **Template-following**: Human follows a rigid structure that happens to resemble AI output

The system cannot distinguish these nuances. It reports a single 0–100 score reflecting statistical similarity to AI patterns in the training corpus.

---

## 8. Statistical Approach Has a Ceiling

**Limitation**: Pure stylometric features have fundamental separation limits.

The strongest signal (syntactic complexity CV) has Cohen's d = 0.939. While this is a "large" effect size, the AI and human distributions still overlap significantly. With 6 stylometric signals and no neural components, the system achieves ~74% accuracy — approaching the practical ceiling for this methodological family on this dataset.

Achieving higher accuracy would likely require:
- Perplexity-based detection (requires LLM inference)
- Embedding-based classifiers (requires training)
- Ensemble methods combining multiple detection paradigms

---

## Summary

| # | Limitation | Severity |
|---|-----------|----------|
| 1 | Not proof of authorship | Critical |
| 2 | High FP on formulaic writing (~30%) | High |
| 3 | Structured AI formatting evades detection | High |
| 4 | Domain-specific calibration only | Medium |
| 5 | No ESL bias data | Medium |
| 6 | Not adversarially hardened | Medium |
| 7 | Binary classification is reductive | Low |
| 8 | Statistical ceiling ~74% accuracy | Inherent |
