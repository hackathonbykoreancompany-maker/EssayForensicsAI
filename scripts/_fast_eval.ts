import * as fs from "fs";
import * as path from "path";
import { analyzeEssay } from "../src/services/essayAnalysisService";

const csvPath = path.resolve(__dirname, "../data/essays.csv");
const text = fs.readFileSync(csvPath, "utf8");

let inQ = false;
let row = "";
let rowCount = 0;
const rows: { text: string; label: "AI" | "Human" }[] = [];

for (let i = 0; i < text.length && rows.length < 5000; i++) {
  const ch = text[i];
  if (ch === '"') inQ = !inQ;
  if (ch === "\n" && !inQ) {
    if (rowCount > 0) {
      const lastComma = row.lastIndexOf(",");
      const label = row.slice(lastComma + 1).trim();
      const essayText = row.slice(0, lastComma).trim().replace(/^"|"$/g, "").replace(/""/g, '"');
      if ((label === "0" || label === "1") && essayText.length > 50) {
        rows.push({ text: essayText, label: label === "1" ? "AI" : "Human" });
      }
    }
    row = "";
    rowCount++;
  } else {
    row += ch;
  }
}

console.log(`Collected ${rows.length} rows for full calibration evaluation.`);

const signalData: any[] = [];
for (const r of rows) {
  const res = analyzeEssay(r.text);
  signalData.push({
    trueLabel: r.label,
    score: res.score.overallScore,
    stdDev: res.sentenceLength.stdDev,
    cv: res.sentenceRhythm.coefficientOfVariation,
    complexityCV: res.sentenceComplexity.complexityCV,
    burstiness: res.burstiness.score,
    mattr: res.lexicalDiversity.mattr,
    sampleSize: res.sentenceLength.lengths.length,
  });
}

function evalWeights(
  weights: { sLen1: number; sLen2: number; rCV1: number; rCV2: number; cCV1: number; cCV2: number; bst1: number; bst2: number; mat1: number; mat2: number; maxRaw: number },
  threshold: number
) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const item of signalData) {
    const hasSample = item.sampleSize >= 3;
    let s = 0;

    if (hasSample) {
      if (item.stdDev < 7) s += weights.sLen1;
      else if (item.stdDev < 9) s += weights.sLen2;
    }
    if (hasSample) {
      if (item.cv < 0.30) s += weights.rCV1;
      else if (item.cv < 0.40) s += weights.rCV2;
    }
    if (hasSample && item.complexityCV > 0) {
      if (item.complexityCV < 1.00) s += weights.cCV1;
      else if (item.complexityCV < 1.35) s += weights.cCV2;
    }
    if (hasSample && item.burstiness > 0) {
      if (item.burstiness < 0.14) s += weights.bst1;
      else if (item.burstiness < 0.22) s += weights.bst2;
    }
    if (item.mattr > 0) {
      if (item.mattr > 0.72) s += weights.mat1;
      else if (item.mattr > 0.68) s += weights.mat2;
    }

    const finalScore = Math.min(100, Math.round((s / weights.maxRaw) * 100));
    const pred = finalScore >= threshold ? "AI" : "Human";

    if (pred === "AI" && item.trueLabel === "AI") tp++;
    else if (pred === "AI" && item.trueLabel === "Human") fp++;
    else if (pred === "Human" && item.trueLabel === "Human") tn++;
    else fn++;
  }

  const acc = (tp + tn) / signalData.length;
  const prec = tp + fp > 0 ? tp / (tp + fp) : 0;
  const rec = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;

  return { acc, prec, rec, f1, tp, fp, tn, fn };
}

// Current baseline
const baselineWeights = { sLen1: 15, sLen2: 9, rCV1: 15, rCV2: 9, cCV1: 30, cCV2: 18, bst1: 20, bst2: 12, mat1: 20, mat2: 12, maxRaw: 100 };
const baselineRes = evalWeights(baselineWeights, 50);
console.log(`BASELINE (threshold=50): Accuracy: ${(baselineRes.acc * 100).toFixed(2)}%, TP: ${baselineRes.tp}, FP: ${baselineRes.fp}, TN: ${baselineRes.tn}, FN: ${baselineRes.fn}`);

// Proposed weights
const optWeights = { sLen1: 10, sLen2: 6, rCV1: 20, rCV2: 12, cCV1: 35, cCV2: 21, bst1: 15, bst2: 9, mat1: 25, mat2: 15, maxRaw: 105 };
const optRes = evalWeights(optWeights, 58);
console.log(`PROPOSED (threshold=58): Accuracy: ${(optRes.acc * 100).toFixed(2)}%, TP: ${optRes.tp}, FP: ${optRes.fp}, TN: ${optRes.tn}, FN: ${optRes.fn}`);
