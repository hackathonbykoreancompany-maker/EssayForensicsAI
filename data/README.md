# Dataset Format — EssayForensics AI Evaluation

Place your labelled dataset file at:

```
data/essays.csv
```

---

## Required CSV Format

```
id,label,text
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string or integer | yes | Unique identifier for the essay |
| `label` | `Human` or `AI` | yes | Ground-truth label (case-insensitive) |
| `text` | string | yes | Full essay text (must be quoted if it contains commas or newlines) |

### Rules

- First row must be the header: `id,label,text`
- `label` must be exactly `Human` or `AI` (case-insensitive: `human`, `ai`, `HUMAN`, `AI` all accepted)
- `text` must be wrapped in double quotes if it contains commas, double quotes, or line breaks
- Embedded double quotes inside `text` must be escaped by doubling them: `"` → `""`
- File encoding: UTF-8
- Line endings: LF or CRLF both accepted

### Minimum recommended size

- At least 20 rows (10 Human, 10 AI) for results to be meaningful
- The evaluator will warn if fewer than 20 rows are present

---

## Example

```csv
id,label,text
1,Human,"This essay was written by a student. The sentences vary quite a bit in length. Some are short. Others go on much longer and explore an idea in depth, which is a pattern typical of human writing."
2,AI,"This essay demonstrates several key points. Each point is clearly articulated. The structure follows a logical progression. The argument is well supported by evidence. The conclusion summarizes the main ideas."
3,human,"Another human-written piece here, with irregular rhythms and somewhat repetitive phrasing."
```

---

## How Classification Works

The evaluator runs `analyzeEssay()` on each row, which returns an `overallScore` from 0–100.

| Score range | Predicted label |
|-------------|-----------------|
| ≥ 50        | `AI`            |
| < 50        | `Human`         |

This threshold is printed in the evaluation report and can be adjusted via the
`--threshold` flag when running the script.

---

## Running the Evaluator

```bash
npm run evaluate
```

Or with a custom score threshold (default: 50):

```bash
npm run evaluate -- --threshold 60
```

Output is printed to stdout. Redirect to a file if needed:

```bash
npm run evaluate > results.txt
```
