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

const stream = fs.createReadStream(DATASET_PATH, { encoding: "utf8", highWaterMark: 64 * 1024 });

let buf = "";
let inQ = false;
let rowCount = 0;

const fps: any[] = [];
const fns: any[] = [];

stream.on("data", (chunk: string | Buffer) => {
  const str = typeof chunk === "string" ? chunk : chunk.toString("utf8");
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"') inQ = !inQ;
    if (ch === "\n" && !inQ) {
      const raw = buf.trim();
      buf = "";
      rowCount++;
      if (rowCount > 1 && raw) {
        const fields = splitRow(raw);
        const text = (fields[0] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
        const labelRaw = (fields[1] ?? "").trim().toLowerCase();

        const isAI = labelRaw === "1" || labelRaw === "ai";
        const isHuman = labelRaw === "0" || labelRaw === "human";

        if ((isAI || isHuman) && text.length > 200) {
          try {
            const res = analyzeEssay(text);
            const score = res.score.overallScore;

            if (isHuman && score >= 65 && fps.length < 3) {
              fps.push({
                row: rowCount,
                trueLabel: "Human",
                score,
                confidence: res.score.confidence,
                breakdown: res.score.breakdown,
                flags: res.score.flags,
                excerpt: text.slice(0, 300) + "...",
              });
            } else if (isAI && score <= 25 && fns.length < 3) {
              fns.push({
                row: rowCount,
                trueLabel: "AI",
                score,
                confidence: res.score.confidence,
                breakdown: res.score.breakdown,
                flags: res.score.flags,
                excerpt: text.slice(0, 300) + "...",
              });
            }

            if (fps.length >= 3 && fns.length >= 3) {
              stream.destroy();
              break;
            }
          } catch (e) {}
        }
      }
    } else {
      buf += ch;
    }
  }
});

stream.on("close", () => {
  const out = { fps, fns };
  fs.writeFileSync(path.resolve(__dirname, "../failures.json"), JSON.stringify(out, null, 2));
  console.log("Done writing failures.json!");
  process.exit(0);
});
