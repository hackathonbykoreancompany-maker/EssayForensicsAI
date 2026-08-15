# EssayForensics AI — Dataset Documentation

This document provides detailed metadata regarding the training and evaluation dataset used to calibrate and benchmark the EssayForensics AI detection engine.

---

## 1. Human Essay Samples

### Source Name
* **PERSUADE 2.0 Corpus** (*Prompt-based Essays Scored on Writing Ability and Use of Evidence*) & public academic writing benchmarks.

### Collection Method & Licensing
* Collected from 6th–12th grade student standardized writing assessments in the United States across multiple school districts.
* Anonymized prior to release to protect student privacy.
* Released under open research and competition licenses for AI text detection benchmarking (e.g., Kaggle LLM - Detect AI Generated Text benchmark).

---

## 2. AI-Generated Essay Samples

### Generation Models
* **OpenAI**: GPT-3.5-Turbo, GPT-4
* **Google**: PaLM 2 / Gemini baseline models
* **Anthropic**: Claude series
* **Open-Source LLMs**: LLaMA-2 (7B, 13B, 70B), Mistral 7B

### Generation Methodology & Prompt Variation
* Generated using prompt engineering targeting the exact same prompt titles assigned to human students.
* **Prompting Variations**:
  - Direct instructions ("Write a persuasive essay about [Topic]").
  - Role-playing prompts ("Act as a 10th-grade student writing an argumentative essay on [Topic]").
  - System instruction variations adjusting essay structure, length (300–800 words), tone, and vocabulary level.

---

## 3. Class Counts & Dataset Distribution

The primary evaluation dataset consists of **29,145** total validated essays:

| Class | Count | Percentage |
| :--- | :---: | :---: |
| **Human-written Essays** | 17,508 | 60.07% |
| **AI-Generated Essays** | 11,637 | 39.93% |
| **Total Evaluation Dataset** | **29,145** | **100.00%** |

*Note: These exact figures are reflected in `scoringService.ts` calibration metrics and `scripts/evaluateDataset.ts`.*

---

## 4. Topic Coverage & Domain Scope

### Represented Topics & Essay Types
The dataset focuses on standard persuasive, argumentative, and expository prompt topics:
* Urban planning & environment (*e.g., Car-free cities, Driverless cars*)
* Science & exploration (*e.g., Exploring Venus, Facial Action Coding System / Emotion detection*)
* Civics & government (*e.g., The Electoral College, Mandatory Community Service*)
* Education & technology (*e.g., Distance learning, Cell phones in schools*)

### Explicitly Untested & Out-of-Scope Domains
The detection engine was calibrated on middle/high school and introductory college-level argumentative essays. It is **currently untested** on:
1. **STEM & Technical Writing**: Code documentation, computer science reports, engineering papers, or math proofs.
2. **Creative Writing & Fiction**: Short stories, poetry, narrative scripts, or dialogue.
3. **Short-Form Text**: Micro-blogs, social media posts, or text messages (<100 words).
4. **Specialized Academic Literature**: Advanced legal briefs, peer-reviewed medical journals, or doctoral dissertations.
5. **Non-English Content**: Essays written in languages other than English.
