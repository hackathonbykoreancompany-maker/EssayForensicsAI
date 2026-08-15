import * as fs from "fs";
import * as path from "path";
import { analyzeEssay } from "../src/services/essayAnalysisService";

const DATASET_PATH = path.resolve(__dirname, "../data/essays.csv");

interface SignalAccumulator {
  sentenceLengthStdDev: number[];
  sentenceRhythmCV: number[];
  mattr: number[];
  burstiness: number[];
  complexityCV: number[];
  repetitionRate: number[];
}

function createAcc(): SignalAccumulator {
  return {
    sentenceLengthStdDev: [],
    sentenceRhythmCV: [],
    mattr: [],
    burstiness: [],
    complexityCV: [],
    repetitionRate: [],
  };
}

const aiAcc = createAcc();
const humanAcc = createAcc();

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

  if ((!isAI && !isHuman) || !text) return;

  try {
    const res = analyzeEssay(text);
    const target = isAI ? aiAcc : humanAcc;

    target.sentenceLengthStdDev.push(res.sentenceLength.stdDev);
    target.sentenceRhythmCV.push(res.sentenceRhythm.coefficientOfVariation);
    target.mattr.push(res.lexicalDiversity.mattr);
    target.burstiness.push(res.burstiness.score);
    target.complexityCV.push(res.sentenceComplexity.complexityCV);
    target.repetitionRate.push(res.repetition.phraseRepetitionRate);

    processed++;
    if (processed % 5000 === 0) {
      console.log(`Processed ${processed} rows...`);
    }
  } catch (e) {
    // skip error rows
  }
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

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[], m: number): number {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function calcStats(arr: number[]) {
  const m = mean(arr);
  const s = stdDev(arr, m);
  return { mean: Number(m.toFixed(4)), stdDev: Number(s.toFixed(4)) };
}

stream.on("end", () => {
  if (csvBuffer.trim()) processRow(csvBuffer.trim());

  console.log(`Finished! Total processed: ${processed}`);
  console.log(`AI count: ${aiAcc.sentenceLengthStdDev.length}, Human count: ${humanAcc.sentenceLengthStdDev.length}`);

  const referenceStats = {
    datasetSize: processed,
    aiCount: aiAcc.sentenceLengthStdDev.length,
    humanCount: humanAcc.sentenceLengthStdDev.length,
    signals: {
      sentenceLengthVariance: {
        ai: calcStats(aiAcc.sentenceLengthStdDev),
        human: calcStats(humanAcc.sentenceLengthStdDev),
      },
      rhythmCV: {
        ai: calcStats(aiAcc.sentenceRhythmCV),
        human: calcStats(humanAcc.sentenceRhythmCV),
      },
      mattr: {
        ai: calcStats(aiAcc.mattr),
        human: calcStats(humanAcc.mattr),
      },
      burstiness: {
        ai: calcStats(aiAcc.burstiness),
        human: calcStats(humanAcc.burstiness),
      },
      syntacticComplexity: {
        ai: calcStats(aiAcc.complexityCV),
        human: calcStats(humanAcc.complexityCV),
      },
      repetition: {
        ai: calcStats(aiAcc.repetitionRate),
        human: calcStats(humanAcc.repetitionRate),
      },
    },
  };

  const outPath = path.resolve(__dirname, "../src/data/referenceStats.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(referenceStats, null, 2));
  console.log(`Wrote reference stats to ${outPath}`);
});
