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
  index: number;
  trueLabel: "Human" | "AI";
  predictedScore: number;
  confidence: string;
  breakdown: any;
  flags: string[];
  excerpt: string;
  fullText: string;
}

const falsePositives: Misclassified[] = []; // Human called AI
const falseNegatives: Misclassified[] = []; // AI called Human

let processed = 0;

function processRow(raw: string): void {
  if (!raw) return;

  if (!colConfig) {
    const cols = raw.toLowerCase().split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const textCol = cols.indexOf("text");
    const labelCol = cols.indexOf("generated") !== -1 ? cols.indexOf("generated") : cols.indexOf("label");
    if (textCol !== -1 && labelCol !== -1) {
      colConfig = { textCol, labelCol };
    }
    return;
  }

  const fields = splitRow(raw);
  const text = (fields[colConfig.textCol] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
  const labelRaw = (fields[colConfig.labelCol] ?? "").trim().toLowerCase();

  const isAI = labelRaw === "1" || labelRaw === "ai";
  const isHuman = labelRaw === "0" || labelRaw === "human";

  if ((!isAI && !isHuman) || text.length < 100) return;

  try {
    const res = analyzeEssay(text);
    const score = res.score.overallScore;
    const confidence = res.score.confidence;

    processed++;

    const item: Misclassified = {
      index: processed,
      trueLabel: isHuman ? "Human" : "AI",
      predictedScore: score,
      confidence,
      breakdown: res.score.breakdown,
      flags: res.score.flags,
      excerpt: text.slice(0, 300) + "...",
      fullText: text,
    };

    if (isHuman && score >= 70 && confidence === "high") {
      falsePositives.push(item);
    } else if (isAI && score <= 20 && confidence === "high") {
      falseNegatives.push(item);
    }
  } catch (e) {}
}

const stream = fs.createReadStream(DATASET_PATH, { encoding: "utf8" });

stream.on("data", (chunk: string | Buffer) => {
  const str = typeof chunk === "string" ? chunk : chunk.toString("utf8");
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
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

  console.log(`Scan finished. Scanned ${processed} rows.`);
  console.log(`High-confidence False Positives (Human scored >= 70): ${falsePositives.length}`);
  console.log(`High-confidence False Negatives (AI scored <= 20): ${falseNegatives.length}`);

  // Sort by highest score for FP and lowest score for FN
  falsePositives.sort((a, b) => b.predictedScore - a.predictedScore);
  falseNegatives.sort((a, b) => a.predictedScore - b.predictedScore);

  console.log("\n--- TOP 3 FALSE POSITIVES (Human -> High AI Score) ---");
  falsePositives.slice(0, 3).forEach((fp, i) => {
    console.log(`\nFP #${i + 1}: Score ${fp.predictedScore} (Conf: ${fp.confidence})`);
    console.log(`Breakdown:`, fp.breakdown);
    console.log(`Flags:`, fp.flags);
    console.log(`Excerpt: ${fp.excerpt}`);
  });

  console.log("\n--- TOP 3 FALSE NEGATIVES (AI -> Low AI Score) ---");
  falseNegatives.slice(0, 3).forEach((fn, i) => {
    console.log(`\nFN #${i + 1}: Score ${fn.predictedScore} (Conf: ${fn.confidence})`);
    console.log(`Breakdown:`, fn.breakdown);
    console.log(`Flags:`, fn.flags);
    console.log(`Excerpt: ${fn.excerpt}`);
  });
});
