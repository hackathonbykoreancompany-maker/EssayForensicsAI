# EssayForensics AI — ESL / Non-Native English Bias Audit Report

## Executive Summary Statement

> **Plain Statement on ESL Bias**: We found **no empirical evidence of ESL bias** in this audit because the evaluation corpus (`data/essays.csv`) lacks non-native speaker metadata tags. Consequently, ESL bias **cannot be confirmed or ruled out** with the current repository dataset.

---

## 1. Dataset Audit & Label Availability

* **Evaluation Dataset Checked**: `data/essays.csv` (29,145 total essays).
* **Column Schema**: `text,generated` (Binary classification: `0 = Human`, `1 = AI`).
* **ESL / L2 Metadata Status**: **ABSENT**. The dataset does not contain metadata indicating writer native language, English proficiency level, TOEFL/IELTS status, or `is_esl` flags.

---

## 2. Requirements for Proper ESL Bias Testing

To test for ESL / L2 bias rigorously and empirically in future benchmarking, the following setup is required:

1. **Benchmark L2 Dataset Integration**:
   - Integrate curated non-native English writing corpora such as:
     - **ICLE** (*International Corpus of Learner English*)
     - **ELLIPSE Corpus** (*English Language Learner Essays*)
     - **TOEFL / IELTS Independent Essay Benchmarks**
2. **Controlled Prompting**:
   - Compare Human L1 (Native) vs. Human L2 (Non-Native) essays written under identical prompt conditions and length constraints.
3. **Targeted Signal Differential Analysis**:
   - Measure if specific stylometric signals disproportionately misfire on L2 writing:
     - **Syntactic Complexity CV**: Do formulaic grammar structures in L2 essays artificially reduce complexity variance?
     - **Lexical Diversity (MATTR)**: Does restricted L2 vocabulary range trigger false-positive AI flags?
     - **Sentence Length Variance & Rhythm CV**: Do repetitive sentence templates in learner writing lower standard deviation metrics?
4. **Statistical Differential Metrics**:
   - Report mean overall score, False Positive Rate (FPR), and Cohen's $d$ effect size for Human L1 vs. Human L2 cohorts.
