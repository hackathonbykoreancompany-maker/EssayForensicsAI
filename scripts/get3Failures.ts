import * as fs from "fs";
import * as path from "path";
import { analyzeEssay } from "../src/services/essayAnalysisService";

const DATASET_PATH = path.resolve(__dirname, "../data/essays.csv");

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

let colConfig: { textCol: number; labelCol: number } | null = null;
let csvBuffer = "";
let csvInQuotes = false;

interface Misclassified {
  rowNum: number;
  trueLabel: "Human" | "AI";
  predictedScore: number;
  confidence: string;
  breakdown: any;
  flags: string[];
  excerpt: string;
}

const falsePositives: Misclassified[] = [];
const falseNegatives: Misclassified[] = [];

let processed = 0;
let lineCount = 0;

const textStr = fs.readFileSync(DATASET_PATH, "utf8");

for (let i = 0; i < textStr.length && processed < 2000; i++) {
  const ch = textStr[i];
  if (ch === '"') csvInQuotes = !csvInQuotes;
  if (ch === "\n" && !csvInQuotes) {
    const raw = csvBuffer.trim();
    csvBuffer = "";
    lineCount++;
    if (lineCount === 1) {
      const cols = raw.toLowerCase().split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const textCol = cols.indexOf("text");
      const labelCol = cols.indexOf("generated") !== -1 ? cols.indexOf("generated") : cols.indexOf("label");
      colConfig = { textCol, labelCol };
      continue;
    }

    if (!colConfig || !raw) continue;

    const fields = splitRow(raw);
    const text = (fields[colConfig.textCol] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
    const labelRaw = (fields[colConfig.labelCol] ?? "").trim().toLowerCase();

    const isAI = labelRaw === "1" || labelRaw === "ai";
    const isHuman = labelRaw === "0" || labelRaw === "human";

    if ((!isAI && !isHuman) || text.length < 150) continue;

    try {
      const res = analyzeEssay(text);
      const score = res.score.overallScore;
      const confidence = res.score.confidence;
      processed++;

      const item: Misclassified = {
        rowNum: lineCount,
        trueLabel: isHuman ? "Human" : "AI",
        predictedScore: score,
        confidence,
        breakdown: res.score.breakdown,
        flags: res.score.flags,
        excerpt: text.slice(0, 350) + "...",
      };

      if (isHuman && score >= 60) {
        falsePositives.push(item);
      } else if (isAI && score <= 30) {
        falseNegatives.push(item);
      }
    } catch (e) {}
  } else {
    csvBuffer += ch;
  }
}

console.log(`Scanned ${processed} rows.`);
console.log(`False Positives count: ${falsePositives.length}`);
console.log(`False Negatives count: ${falseNegatives.length}`);

console.log("\n=== TOP FALSE POSITIVES (Human essay -> AI Score >= 60) ===");
falsePositives.sort((a, b) => b.predictedScore - a.predictedScore);
falsePositives.slice(0, 3).forEach((item, idx) => {
  console.log(`\nFP #${idx + 1} (Row ${item.rowNum}):`);
  console.log(`Score: ${item.predictedScore} | Confidence: ${item.confidence}`);
  console.log(`Breakdown:`, item.breakdown);
  console.log(`Flags:`, item.flags);
  console.log(`Excerpt: ${item.excerpt}`);
});

console.log("\n=== TOP FALSE NEGATIVES (AI essay -> Human Score <= 30) ===");
falseNegatives.sort((a, b) => a.predictedScore - b.predictedScore);
falseNegatives.slice(0, 3).forEach((item, idx) => {
  console.log(`\nFN #${idx + 1} (Row ${item.rowNum}):`);
  console.log(`Score: ${item.predictedScore} | Confidence: ${item.confidence}`);
  console.log(`Breakdown:`, item.breakdown);
  console.log(`Flags:`, item.flags);
  console.log(`Excerpt: ${item.excerpt}`);
});
