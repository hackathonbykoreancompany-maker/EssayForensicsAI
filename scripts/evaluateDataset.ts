/**
 * evaluateDataset.ts
 *
 * Streams data/essays.csv, runs analyzeEssay() on every row, compares
 * predicted vs actual labels, and prints evaluation metrics.
 *
 * Supports two CSV formats:
 *   Format A (production dataset): columns  text, generated  (label 0=Human 1=AI)
 *   Format B (custom dataset):     columns  id, label, text  (label "Human"/"AI")
 *
 * Usage:
 *   npm run evaluate
 *   npm run evaluate -- --threshold 60
 *
 * Default threshold (calibrated against 29 145-row dataset): 60
 * See data/README.md for CSV format details.
 */

import * as fs from "fs";
import * as path from "path";
import { analyzeEssay } from "../src/services/essayAnalysisService";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATASET_PATH = path.resolve(__dirname, "../data/essays.csv");

/**
 * Calibrated decision threshold.
 * Threshold sweep over 29 145 labelled essays found threshold=50 maximises F1
 * after adding burstiness, lexical diversity, and sentence complexity signals.
 * Override with --threshold <n>.
 */
const DEFAULT_THRESHOLD = 50;
const MIN_RECOMMENDED_ROWS = 20;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseThreshold(): number {
  const idx = process.argv.indexOf("--threshold");
  if (idx !== -1 && process.argv[idx + 1]) {
    const val = Number(process.argv[idx + 1]);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
    console.error(
      `Invalid --threshold "${process.argv[idx + 1]}". Must be 0–100. Using default ${DEFAULT_THRESHOLD}.`
    );
  }
  return DEFAULT_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrueLabel = "AI" | "Human";

interface EvalAccumulator {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  processed: number;
  skipped: number;
  aiScores: number[];
  humanScores: number[];
  // Per-signal distribution accumulators
  aiStdDev: number[];
  humanStdDev: number[];
  aiCV: number[];
  humanCV: number[];
  aiComplexityCV: number[];
  humanComplexityCV: number[];
  aiBurstiness: number[];
  humanBurstiness: number[];
  aiMattr: number[];
  humanMattr: number[];
}

// ---------------------------------------------------------------------------
// Label normalisation — handles both "0/1" and "Human/AI" formats
// ---------------------------------------------------------------------------

function normaliseLabel(raw: string): TrueLabel | null {
  const v = raw.trim().toLowerCase();
  if (v === "1" || v === "ai") return "AI";
  if (v === "0" || v === "human") return "Human";
  return null;
}

// ---------------------------------------------------------------------------
// Streaming CSV row extractor
//
// Detects column format from header and extracts text + label per row.
// Handles RFC-4180 quoted fields with embedded commas and newlines.
// ---------------------------------------------------------------------------

interface ColConfig {
  textCol: number;
  labelCol: number;
  hasIdCol: boolean;
}

function detectColumns(header: string): ColConfig | null {
  const cols = header.toLowerCase().split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const textCol  = cols.indexOf("text");
  const labelCol = cols.indexOf("generated") !== -1
    ? cols.indexOf("generated")
    : cols.indexOf("label");
  if (textCol === -1 || labelCol === -1) return null;
  return { textCol, labelCol, hasIdCol: cols.indexOf("id") !== -1 };
}

/** Extract field at column index from a parsed fields array. */
function getField(fields: string[], idx: number): string {
  return (fields[idx] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
}

/**
 * Splits a raw CSV row string into fields, respecting quoted fields.
 * NOTE: this operates on a single logical row (newlines inside quotes
 * are handled by the streaming buffer below).
 */
function splitRow(row: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    const next = row[i + 1];
    if (inQ) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ",") { fields.push(field); field = ""; }
      else { field += ch; }
    }
  }
  fields.push(field);
  return fields;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function pct(n: number, d: number): string {
  return d === 0 ? "0.0%" : ((n / d) * 100).toFixed(1) + "%";
}

function safe(n: number, d: number): number {
  return d === 0 ? 0 : n / d;
}

function hr(char = "─", width = 64): string {
  return char.repeat(width);
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function printSignalRow(
  label: string,
  aiArr: number[],
  humanArr: number[]
): void {
  const aiSorted    = [...aiArr].sort((a, b) => a - b);
  const humanSorted = [...humanArr].sort((a, b) => a - b);
  const aiMean    = aiArr.length ? aiArr.reduce((a, b) => a + b, 0) / aiArr.length : 0;
  const humanMean = humanArr.length ? humanArr.reduce((a, b) => a + b, 0) / humanArr.length : 0;
  console.log(
    `  ${label.padEnd(28)}` +
    `mean=${aiMean.toFixed(2).padEnd(8)} p50=${percentile(aiSorted,50).toFixed(2).padEnd(8)}` +
    `  |  ` +
    `mean=${humanMean.toFixed(2).padEnd(8)} p50=${percentile(humanSorted,50).toFixed(2)}`
  );
}

// ---------------------------------------------------------------------------
// Main — streaming evaluation
// ---------------------------------------------------------------------------

function main(): void {
  const threshold = parseThreshold();

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`\nDataset not found: ${DATASET_PATH}`);
    console.error("See data/README.md for the required CSV format.\n");
    process.exit(1);
  }

  const acc: EvalAccumulator = {
    tp: 0, fp: 0, tn: 0, fn: 0,
    processed: 0, skipped: 0,
    aiScores: [], humanScores: [],
    aiStdDev: [], humanStdDev: [],
    aiCV: [], humanCV: [],
    aiComplexityCV: [], humanComplexityCV: [],
    aiBurstiness: [], humanBurstiness: [],
    aiMattr: [], humanMattr: [],
  };

  let colConfig: ColConfig | null = null;
  let csvBuffer = "";
  let csvInQuotes = false;

  function processRow(raw: string): void {
    if (!raw) return;

    if (!colConfig) {
      // First row = header
      colConfig = detectColumns(raw);
      if (!colConfig) {
        console.error(`Unrecognised CSV columns: "${raw}"`);
        console.error('Expected "text,generated" or "id,label,text". See data/README.md.');
        process.exit(1);
      }
      return;
    }

    const fields    = splitRow(raw);
    const text      = getField(fields, colConfig.textCol);
    const labelRaw  = getField(fields, colConfig.labelCol);
    const trueLabel = normaliseLabel(labelRaw);

    if (!trueLabel || !text) { acc.skipped++; return; }

    let result;
    try { result = analyzeEssay(text); } catch { acc.skipped++; return; }

    const score     = result.score.overallScore;
    const predicted: TrueLabel = score >= threshold ? "AI" : "Human";

    if (predicted === "AI"    && trueLabel === "AI")    acc.tp++;
    else if (predicted === "AI"    && trueLabel === "Human") acc.fp++;
    else if (predicted === "Human" && trueLabel === "Human") acc.tn++;
    else                                                      acc.fn++;

    if (trueLabel === "AI") {
      acc.aiScores.push(score);
      acc.aiStdDev.push(result.sentenceLength.stdDev);
      acc.aiCV.push(result.sentenceRhythm.coefficientOfVariation);
      acc.aiComplexityCV.push(result.sentenceComplexity.complexityCV);
      acc.aiBurstiness.push(result.burstiness.score);
      acc.aiMattr.push(result.lexicalDiversity.mattr);
    } else {
      acc.humanScores.push(score);
      acc.humanStdDev.push(result.sentenceLength.stdDev);
      acc.humanCV.push(result.sentenceRhythm.coefficientOfVariation);
      acc.humanComplexityCV.push(result.sentenceComplexity.complexityCV);
      acc.humanBurstiness.push(result.burstiness.score);
      acc.humanMattr.push(result.lexicalDiversity.mattr);
    }

    acc.processed++;
    if (acc.processed % 5000 === 0) {
      process.stderr.write(`  processed ${acc.processed}...\n`);
    }
  }

  const stream = fs.createReadStream(DATASET_PATH, { encoding: "utf8" });

  stream.on("data", (chunk: string | Buffer) => {
    const chunkStr = typeof chunk === "string" ? chunk : chunk.toString("utf8");
    for (let i = 0; i < chunkStr.length; i++) {
      const ch = chunkStr[i];
      if (ch === '"') csvInQuotes = !csvInQuotes;
      if (ch === "\n" && !csvInQuotes) {
        processRow(csvBuffer.trim());
        csvBuffer = "";
      } else {
        csvBuffer += ch;
      }
    }
  });

  stream.on("end", () => {
    if (csvBuffer.trim()) processRow(csvBuffer.trim());

    const { tp, fp, tn, fn } = acc;
    const total   = tp + fp + tn + fn;
    const correct = tp + tn;

    if (total === 0) {
      console.error("No valid rows found. Check CSV format.");
      process.exit(1);
    }
    if (total < MIN_RECOMMENDED_ROWS) {
      console.warn(`\nWarning: only ${total} valid rows. At least ${MIN_RECOMMENDED_ROWS} recommended.\n`);
    }

    const accuracy  = safe(correct, total);
    const precision = safe(tp, tp + fp);
    const recall    = safe(tp, tp + fn);
    const f1        = safe(2 * precision * recall, precision + recall);

    const aiMeanScore    = acc.aiScores.length
      ? acc.aiScores.reduce((a, b) => a + b, 0) / acc.aiScores.length : 0;
    const humanMeanScore = acc.humanScores.length
      ? acc.humanScores.reduce((a, b) => a + b, 0) / acc.humanScores.length : 0;
    const overallMeanScore = (aiMeanScore * acc.aiScores.length + humanMeanScore * acc.humanScores.length) / total;

    console.log(`\n${hr("═")}`);
    console.log(`  EssayForensics AI — Dataset Evaluation`);
    console.log(hr("═"));
    console.log(`  Dataset   : ${DATASET_PATH}`);
    console.log(`  Rows      : ${total} valid  (${acc.skipped} skipped)`);
    console.log(`  AI labels : ${tp + fn}  |  Human labels: ${fp + tn}`);
    console.log(`  Threshold : score ≥ ${threshold} → predicted AI  (calibrated default: ${DEFAULT_THRESHOLD})`);

    console.log(`\n${hr()}`);
    console.log(`  OVERALL METRICS`);
    console.log(hr());
    console.log(`  Accuracy  : ${pct(correct, total).padEnd(8)}  (${correct}/${total} correct)`);
    console.log(`  Precision : ${pct(tp, tp+fp).padEnd(8)}  (of predicted AI, actually AI)`);
    console.log(`  Recall    : ${pct(tp, tp+fn).padEnd(8)}  (of actual AI essays caught)`);
    console.log(`  F1        : ${(f1 * 100).toFixed(1)}%`);

    console.log(`\n${hr()}`);
    console.log(`  CONFUSION MATRIX  (positive class = AI)`);
    console.log(hr());
    console.log(`                   Predicted AI    Predicted Human`);
    console.log(`  Actual AI     :  ${String(tp).padStart(6)} (TP)     ${String(fn).padStart(6)} (FN)`);
    console.log(`  Actual Human  :  ${String(fp).padStart(6)} (FP)     ${String(tn).padStart(6)} (TN)`);

    console.log(`\n${hr()}`);
    console.log(`  SIGNAL DISTRIBUTIONS  (AI columns | Human columns)`);
    console.log(hr());
    console.log(`  ${"Signal".padEnd(28)}${"── AI ──".padEnd(24)}  ${"── Human ──"}`);
    printSignalRow("stdDev (sentence length)", acc.aiStdDev,        acc.humanStdDev);
    printSignalRow("CV     (sentence rhythm)", acc.aiCV,            acc.humanCV);
    printSignalRow("complexity CV (punct)",    acc.aiComplexityCV,  acc.humanComplexityCV);
    printSignalRow("burstiness (Fano)",        acc.aiBurstiness,    acc.humanBurstiness);
    printSignalRow("MATTR (lexical div.)",     acc.aiMattr,         acc.humanMattr);
    printSignalRow("overallScore",             acc.aiScores,        acc.humanScores);

    console.log(`\n${hr()}`);
    console.log(`  SCORE DISTRIBUTION`);
    console.log(hr());
    console.log(`  Overall avg score : ${overallMeanScore.toFixed(1)}`);
    console.log(`  Avg score (AI)    : ${aiMeanScore.toFixed(1)}  (n=${acc.aiScores.length})`);
    console.log(`  Avg score (Human) : ${humanMeanScore.toFixed(1)}  (n=${acc.humanScores.length})`);

    // Score histogram
    const bands = [[0,10],[10,20],[20,30],[30,40],[40,50],[50,60],[60,70],[70,80],[80,90],[90,101]];
    console.log(`\n  ${"Band".padEnd(10)} ${"AI%".padEnd(10)} ${"Human%"}`);
    for (const [lo, hi] of bands) {
      const hiLabel = hi === 101 ? 100 : hi;
      const aiN    = acc.aiScores.filter(s => s >= lo && s < hi).length;
      const humanN = acc.humanScores.filter(s => s >= lo && s < hi).length;
      const aiP    = acc.aiScores.length    ? (aiN    / acc.aiScores.length    * 100).toFixed(1) : "0.0";
      const humanP = acc.humanScores.length ? (humanN / acc.humanScores.length * 100).toFixed(1) : "0.0";
      console.log(`  ${(lo + "–" + hiLabel).padEnd(10)} ${aiP.padEnd(10)} ${humanP}`);
    }

    console.log(`\n${hr("═")}\n`);
  });

  stream.on("error", (e: Error) => {
    console.error("Stream error:", e.message);
    process.exit(1);
  });
}

main();
