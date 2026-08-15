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

const content = fs.readFileSync(DATASET_PATH, "utf8");
let buf = "";
let inQ = false;
let rowCount = 0;

const targetRows: { [key: number]: { text: string; label: string } } = {};

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === '"') inQ = !inQ;
  if (ch === "\n" && !inQ) {
    const raw = buf.trim();
    buf = "";
    rowCount++;
    if (rowCount === 787 || rowCount === 842) {
      const fields = splitRow(raw);
      const text = (fields[0] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
      const label = (fields[1] ?? "").trim();
      targetRows[rowCount] = { text, label };
    }
    if (rowCount > 900) break;
  } else {
    buf += ch;
  }
}

console.log("=== RELATIVE DISTANCE Z-SCORE TEST FOR ROWS #787 & #842 ===");

for (const rNum of [787, 842]) {
  const item = targetRows[rNum];
  if (!item) {
    console.log(`Row #${rNum} not found!`);
    continue;
  }
  const result = analyzeEssay(item.text);
  console.log(`\nRow #${rNum} (True Label: ${item.label === "0" ? "Human" : "AI"}):`);
  console.log(`Excerpt: ${item.text.slice(0, 200)}...`);
  console.log(`Overall Score: ${result.score.overallScore} (Confidence: ${result.score.confidence})`);
  console.log("Breakdown:", JSON.stringify(result.score.breakdown, null, 2));
  console.log("Flags:", result.score.flags);
}
