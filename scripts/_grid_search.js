/**
 * _grid_search.js  (v2)
 *
 * Streams once to collect raw signal values, then sweeps weight and
 * threshold combinations in the same step-function scoring space as
 * the existing scoringService.ts.
 *
 * Parameterised scorer mirrors calculateScore() exactly — same thresholds,
 * only the point values (weights) vary.
 *
 * Temporary helper — safe to delete after calibration.
 */

require('ts-node').register({
  project: require('path').resolve(__dirname, '../tsconfig.scripts.json'),
  transpileOnly: true,
});

const fs   = require('fs');
const path = require('path');
const { analyzeEssay } = require('../src/services/essayAnalysisService');

const FILE = path.resolve(__dirname, '../data/essays.csv');

const rows = [];
let csvBuffer = '', csvInQuotes = false, header = null, processed = 0;

function processRow(raw) {
  if (!raw) return;
  if (!header) { header = raw; return; }
  let inQ = false, lastComma = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '"') inQ = !inQ;
    else if (raw[i] === ',' && !inQ) lastComma = i;
  }
  const labelRaw = raw.slice(lastComma + 1).trim().replace(/^"|"$/g, '');
  const trueLabel = (labelRaw === '1' || labelRaw.toLowerCase() === 'ai') ? 'AI' : 'Human';
  let text = raw.slice(0, lastComma).trim();
  if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1).replace(/""/g, '"');
  if (!text) return;
  let result;
  try { result = analyzeEssay(text); } catch { return; }
  rows.push({
    trueLabel,
    stdDev:       result.sentenceLength.stdDev,
    cv:           result.sentenceRhythm.coefficientOfVariation,
    complexityCV: result.sentenceComplexity.complexityCV,
    burstiness:   result.burstiness.score,
    mattr:        result.lexicalDiversity.mattr,
    sampleSize:   result.sentenceLength.lengths.length,
  });
  processed++;
  if (processed % 5000 === 0) process.stderr.write(`  ${processed}...\n`);
}

const stream = fs.createReadStream(FILE, { encoding: 'utf8' });
stream.on('data', chunk => {
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];
    if (ch === '"') csvInQuotes = !csvInQuotes;
    if (ch === '\n' && !csvInQuotes) { processRow(csvBuffer.trim()); csvBuffer = ''; }
    else csvBuffer += ch;
  }
});
stream.on('end', () => {
  if (csvBuffer.trim()) processRow(csvBuffer.trim());
  process.stderr.write(`  Done. ${rows.length} rows collected.\n`);
  runSearch();
});
stream.on('error', e => { console.error(e.message); process.exit(1); });

// ── Parameterised scorer (mirrors scoringService.ts step-function logic) ──

function score(row, w) {
  // w = { sLen1, sLen2, rCV1, rCV2, cCV1, cCV2, bst1, bst2, mat1, mat2, maxRaw }
  const ok = row.sampleSize >= 3;
  let s = 0;

  // 1. stdDev
  if (ok) {
    if (row.stdDev < 7)      s += w.sLen1;
    else if (row.stdDev < 9) s += w.sLen2;
  }
  // 2. rhythm CV
  if (ok) {
    if (row.cv < 0.30)      s += w.rCV1;
    else if (row.cv < 0.40) s += w.rCV2;
  }
  // 3. complexity CV
  if (ok && row.complexityCV > 0) {
    if (row.complexityCV < 1.00)      s += w.cCV1;
    else if (row.complexityCV < 1.35) s += w.cCV2;
  }
  // 4. burstiness
  if (ok && row.burstiness > 0) {
    if (row.burstiness < 0.14)      s += w.bst1;
    else if (row.burstiness < 0.22) s += w.bst2;
  }
  // 5. MATTR (inverted: high = AI)
  if (row.mattr > 0) {
    if (row.mattr > 0.72)      s += w.mat1;
    else if (row.mattr > 0.68) s += w.mat2;
  }

  return Math.min(100, Math.round((s / w.maxRaw) * 100));
}

function evaluate(w, threshold) {
  let tp=0,fp=0,tn=0,fn=0;
  for (const row of rows) {
    const sc = score(row, w);
    const pred = sc >= threshold ? 'AI' : 'Human';
    if (pred==='AI'    && row.trueLabel==='AI')    tp++;
    else if (pred==='AI'    && row.trueLabel==='Human') fp++;
    else if (pred==='Human' && row.trueLabel==='Human') tn++;
    else fn++;
  }
  const prec = tp+fp===0 ? 0 : tp/(tp+fp);
  const rec  = tp+fn===0 ? 0 : tp/(tp+fn);
  const f1   = prec+rec===0 ? 0 : 2*prec*rec/(prec+rec);
  const acc  = (tp+tn)/rows.length;
  return { tp,fp,tn,fn,acc,prec,rec,f1 };
}

function runSearch() {
  // ── CURRENT weights (exact copy from scoringService.ts) ──────────────
  const CURRENT = { sLen1:15,sLen2:9, rCV1:15,rCV2:9, cCV1:30,cCV2:18, bst1:20,bst2:12, mat1:20,mat2:12, maxRaw:100 };
  const curAt50  = evaluate(CURRENT, 50);
  const curAt60  = evaluate(CURRENT, 60);

  const pct = (n,d) => d===0?'0.0%':(n/d*100).toFixed(1)+'%';
  const hr  = () => '─'.repeat(64);

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  CURRENT SCORER');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  threshold=50  Acc=${(curAt50.acc*100).toFixed(1)}%  Prec=${pct(curAt50.tp,curAt50.tp+curAt50.fp)}  Rec=${pct(curAt50.tp,curAt50.tp+curAt50.fn)}  F1=${(curAt50.f1*100).toFixed(1)}%`);
  console.log(`  threshold=60  Acc=${(curAt60.acc*100).toFixed(1)}%  Prec=${pct(curAt60.tp,curAt60.tp+curAt60.fp)}  Rec=${pct(curAt60.tp,curAt60.tp+curAt60.fn)}  F1=${(curAt60.f1*100).toFixed(1)}%`);

  // ── Grid search ─────────────────────────────────────────────────────
  // Vary the 5 "strong" point values; keep ratios sensible.
  // cCV1 always highest (d=0.939); others proportional to their Cohen's d.
  // Also sweep the secondary threshold values (cCV2, bst2, mat2) to see
  // if tighter step functions help.

  const results = [];

  // cCV1 choices: 25, 30, 35, 40
  // bst1 choices: 15, 20, 25
  // mat1 choices: 15, 20, 25
  // sLen1 choices: 10, 15, 20
  // rCV1 choices: 10, 15, 20
  // Secondary values always = strong * 0.6
  // maxRaw = cCV1 + bst1 + mat1 + sLen1 + rCV1 (sum of strong values)
  // Threshold sweep: 45..65

  for (const cCV1 of [25,30,35,40]) {
    for (const bst1 of [15,20,25]) {
      for (const mat1 of [15,20,25]) {
        for (const sLen1 of [10,15,20]) {
          for (const rCV1 of [10,15,20]) {
            const w = {
              sLen1, sLen2: Math.round(sLen1*0.6),
              rCV1,  rCV2:  Math.round(rCV1*0.6),
              cCV1,  cCV2:  Math.round(cCV1*0.6),
              bst1,  bst2:  Math.round(bst1*0.6),
              mat1,  mat2:  Math.round(mat1*0.6),
              maxRaw: cCV1+bst1+mat1+sLen1+rCV1,
            };
            for (const t of [45,48,50,52,55,58,60,62,65]) {
              const m = evaluate(w, t);
              results.push({ ...w, t, ...m });
            }
          }
        }
      }
    }
  }

  // Balanced score: reward both high accuracy AND high F1
  const balanced = r => 0.55*r.acc + 0.45*r.f1;
  results.sort((a,b) => balanced(b) - balanced(a));

  console.log('\n'+hr());
  console.log('  TOP 15 BY BALANCED SCORE (0.55*acc + 0.45*f1)');
  console.log(hr());
  console.log(`  ${'cCV1'.padEnd(6)}${'bst1'.padEnd(6)}${'mat1'.padEnd(6)}${'sLen1'.padEnd(7)}${'rCV1'.padEnd(6)}${'t'.padEnd(5)}${'Acc'.padEnd(8)}${'Prec'.padEnd(8)}${'Rec'.padEnd(8)}F1`);
  results.slice(0,15).forEach(r => {
    console.log(
      `  ${String(r.cCV1).padEnd(6)}${String(r.bst1).padEnd(6)}${String(r.mat1).padEnd(6)}${String(r.sLen1).padEnd(7)}${String(r.rCV1).padEnd(6)}` +
      `${String(r.t).padEnd(5)}${(r.acc*100).toFixed(1).padEnd(8)}${(r.prec*100).toFixed(1).padEnd(8)}${(r.rec*100).toFixed(1).padEnd(8)}${(r.f1*100).toFixed(1)}`
    );
  });

  const best = results[0];
  console.log('\n'+hr());
  console.log('  BEST COMBINATION');
  console.log(hr());
  console.log(`  cCV1=${best.cCV1} cCV2=${best.cCV2}  bst1=${best.bst1} bst2=${best.bst2}  mat1=${best.mat1} mat2=${best.mat2}  sLen1=${best.sLen1} sLen2=${best.sLen2}  rCV1=${best.rCV1} rCV2=${best.rCV2}`);
  console.log(`  maxRaw=${best.maxRaw}  threshold=${best.t}`);
  console.log(`  Accuracy=${(best.acc*100).toFixed(1)}%  Precision=${pct(best.tp,best.tp+best.fp)}  Recall=${pct(best.tp,best.tp+best.fn)}  F1=${(best.f1*100).toFixed(1)}%`);
  console.log(`  TP=${best.tp}  FP=${best.fp}  TN=${best.tn}  FN=${best.fn}`);

  // Also show best-by-accuracy and best-by-F1 separately
  const byAcc = [...results].sort((a,b)=>b.acc-a.acc)[0];
  const byF1  = [...results].sort((a,b)=>b.f1-a.f1)[0];
  console.log('\n'+hr());
  console.log(`  BEST BY ACCURACY: cCV1=${byAcc.cCV1} bst1=${byAcc.bst1} mat1=${byAcc.mat1} sLen1=${byAcc.sLen1} rCV1=${byAcc.rCV1} maxRaw=${byAcc.maxRaw} t=${byAcc.t}`);
  console.log(`    Acc=${(byAcc.acc*100).toFixed(1)}%  Prec=${pct(byAcc.tp,byAcc.tp+byAcc.fp)}  Rec=${pct(byAcc.tp,byAcc.tp+byAcc.fn)}  F1=${(byAcc.f1*100).toFixed(1)}%`);
  console.log(`  BEST BY F1:       cCV1=${byF1.cCV1}  bst1=${byF1.bst1}  mat1=${byF1.mat1}  sLen1=${byF1.sLen1}  rCV1=${byF1.rCV1}  maxRaw=${byF1.maxRaw}  t=${byF1.t}`);
  console.log(`    Acc=${(byF1.acc*100).toFixed(1)}%  Prec=${pct(byF1.tp,byF1.tp+byF1.fp)}  Rec=${pct(byF1.tp,byF1.tp+byF1.fn)}  F1=${(byF1.f1*100).toFixed(1)}%`);
  console.log('\n════════════════════════════════════════════════════════════════\n');
}
