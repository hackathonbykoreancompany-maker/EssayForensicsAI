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

const fileStream = fs.createReadStream(DATASET_PATH, { encoding: "utf8" });

let buf = "";
let inQ = false;
let isHeader = true;

let totalHuman = 0;
let totalAi = 0;

let humanGe50 = 0;
let humanGe60 = 0;
let humanGe70 = 0;

let aiLt50 = 0;
let aiLe30 = 0;
let aiLe20 = 0;

let correct50 = 0;
let processed = 0;

console.log("Recomputing threshold counts in a single pass with robust CSV parsing...");

fileStream.on("data", (chunk: string | Buffer) => {
  const text = chunk.toString();
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') inQ = !inQ;
    if (ch === "\n" && !inQ) {
      const line = buf.trim();
      buf = "";
      if (line) {
        if (isHeader) {
          isHeader = false;
        } else {
          const fields = splitRow(line);
          if (fields.length >= 2) {
            const essayText = (fields[0] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
            const rawLabel = (fields[1] ?? "").trim();
            if (essayText) {
              processed++;
              if (processed % 5000 === 0) {
                console.log(`  processed ${processed}...`);
              }
              const isAi = rawLabel === "1";
              if (isAi) totalAi++; else totalHuman++;

              const result = analyzeEssay(essayText);
              const score = result.score.overallScore;

              if (!isAi) {
                // Human essay
                if (score >= 50) humanGe50++;
                if (score >= 60) humanGe60++;
                if (score >= 70) humanGe70++;
                if (score < 50) correct50++;
              } else {
                // AI essay
                if (score >= 50) correct50++;
                if (score < 50) aiLt50++;
                if (score <= 30) aiLe30++;
                if (score <= 20) aiLe20++;
              }
            }
          }
        }
      }
    } else {
      buf += ch;
    }
  }
});

fileStream.on("end", () => {
  if (buf.trim() && !isHeader) {
    const fields = splitRow(buf.trim());
    if (fields.length >= 2) {
      const essayText = (fields[0] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
      const rawLabel = (fields[1] ?? "").trim();
      if (essayText) {
        const isAi = rawLabel === "1";
        if (isAi) totalAi++; else totalHuman++;
        const result = analyzeEssay(essayText);
        const score = result.score.overallScore;
        if (!isAi) {
          if (score >= 50) humanGe50++;
          if (score >= 60) humanGe60++;
          if (score >= 70) humanGe70++;
          if (score < 50) correct50++;
        } else {
          if (score >= 50) correct50++;
          if (score < 50) aiLt50++;
          if (score <= 30) aiLe30++;
          if (score <= 20) aiLe20++;
        }
      }
    }
  }

  const total = totalHuman + totalAi;
  const accuracy = (correct50 / total) * 100;

  console.log("\n════════════════════════════════════════════════════════════════");
  console.log("  SINGLE-PASS THRESHOLD RECOMPUTATION REPORT");
  console.log("════════════════════════════════════════════════════════════════");
  console.log(`Total Essays Analyzed: ${total} (Human: ${totalHuman}, AI: ${totalAi})`);
  console.log(`Overall Accuracy (score >= 50 -> AI): ${accuracy.toFixed(2)}% (${correct50}/${total})`);
  console.log("\n--- HUMAN ESSAYS (FP Threshold Escalation) ---");
  console.log(`Human essays score >= 50: ${humanGe50} / ${totalHuman} (${((humanGe50 / totalHuman) * 100).toFixed(2)}%)`);
  console.log(`Human essays score >= 60: ${humanGe60} / ${totalHuman} (${((humanGe60 / totalHuman) * 100).toFixed(2)}%)`);
  console.log(`Human essays score >= 70: ${humanGe70} / ${totalHuman} (${((humanGe70 / totalHuman) * 100).toFixed(2)}%)`);
  console.log("\n--- AI ESSAYS (FN Threshold Escalation) ---");
  console.log(`AI essays score < 50: ${aiLt50} / ${totalAi} (${((aiLt50 / totalAi) * 100).toFixed(2)}%)`);
  console.log(`AI essays score <= 30: ${aiLe30} / ${totalAi} (${((aiLe30 / totalAi) * 100).toFixed(2)}%)`);
  console.log(`AI essays score <= 20: ${aiLe20} / ${totalAi} (${((aiLe20 / totalAi) * 100).toFixed(2)}%)`);
  console.log("════════════════════════════════════════════════════════════════\n");
});
