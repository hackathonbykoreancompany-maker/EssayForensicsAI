/**
 * AnalysisResult.tsx
 *
 * Displays the combined EssayAnalysisResult in a compact, sleek card layout.
 * Includes the overall AI score, confidence, flags, sentence length, sentence rhythm,
 * and repetition analysis tables.
 */

import type { ReactNode } from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { RepeatedTerm } from "../services/signals/repetition";
import type { SentenceLengthBucket } from "../services/signals/sentenceRhythm";

interface AnalysisResultProps {
  result: EssayAnalysisResult;
}

// ---------------------------------------------------------------------------
// Helpers & Sub-components
// ---------------------------------------------------------------------------

function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
      {title && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function MetricTile({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-lg font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

const BUCKET_STYLES: Record<SentenceLengthBucket, string> = {
  short: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  medium: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  long: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function BucketPill({ bucket, index }: { bucket: SentenceLengthBucket; index: number }) {
  return (
    <span
      className={`inline-block w-3 h-3.5 rounded-sm border ${BUCKET_STYLES[bucket]}`}
      title={`Sentence ${index + 1}: ${bucket}`}
    />
  );
}

function TermTable({ terms, emptyMessage }: { terms: RepeatedTerm[]; emptyMessage: string }) {
  if (terms.length === 0) {
    return <p className="text-xs text-slate-500 italic py-1">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <th className="pb-1.5 font-medium">Term</th>
            <th className="pb-1.5 font-medium text-right">Count</th>
            <th className="pb-1.5 font-medium text-right">Freq</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {terms.slice(0, 5).map((t) => (
            <tr key={t.term}>
              <td className="py-1.5 font-mono text-slate-200">{t.term}</td>
              <td className="py-1.5 text-right font-medium text-slate-300">{t.count}</td>
              <td className="py-1.5 text-right text-slate-400">
                {(t.frequency * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const { characterCount, wordCount, sentenceLength, sentenceRhythm, repetition, score } = result;

  // Determine score severity styling
  let scoreColor = "text-emerald-400";
  let scoreBg = "bg-emerald-500/10 border-emerald-500/30";
  let barGradient = "from-emerald-500 to-teal-500";
  let riskLabel = "Low AI Risk (Likely Human)";

  if (score.overallScore >= 60) {
    scoreColor = "text-rose-400";
    scoreBg = "bg-rose-500/10 border-rose-500/30";
    barGradient = "from-amber-500 via-rose-500 to-red-500";
    riskLabel = "High AI Probability";
  } else if (score.overallScore >= 30) {
    scoreColor = "text-amber-400";
    scoreBg = "bg-amber-500/10 border-amber-500/30";
    barGradient = "from-yellow-500 to-amber-500";
    riskLabel = "Moderate AI Indicators";
  }

  return (
    <div className="space-y-4">
      {/* ── OVERALL ASSESSMENT CARD ──────────────────────────────────── */}
      <div className={`rounded-xl border ${scoreBg} p-5 space-y-4 bg-slate-900/90 shadow-md`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Overall AI Score
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium uppercase">
                {score.confidence} confidence
              </span>
            </div>
            <h2 className={`text-xl font-bold mt-1 ${scoreColor}`}>
              {riskLabel}
            </h2>
          </div>

          <div className="text-right">
            <span className={`text-3xl font-extrabold tracking-tight ${scoreColor}`}>
              {score.overallScore}%
            </span>
            <p className="text-[11px] text-slate-400">AI Likelihood Score</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
            style={{ width: `${score.overallScore}%` }}
          />
        </div>

        {/* Risk Flags */}
        {score.flags.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-400 mb-1.5">Detected Flags:</p>
            <div className="flex flex-wrap gap-1.5">
              {score.flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  <span className="text-rose-400">⚠️</span> {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signal Score Breakdown */}
        {score.breakdown && (
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Signal Contribution Breakdown
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Length Signal</span>
                <span className="font-bold text-slate-200">{score.breakdown.sentenceLengthScore} pts</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Rhythm Signal</span>
                <span className="font-bold text-slate-200">{score.breakdown.sentenceRhythmScore} pts</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Repetition Signal</span>
                <span className="font-bold text-slate-200">{score.breakdown.repetitionScore} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── OVERVIEW METRICS GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricTile label="Words" value={wordCount} />
        <MetricTile label="Characters" value={characterCount} />
        <MetricTile label="Sentences" value={sentenceLength.lengths.length} />
        <MetricTile label="Unique Words" value={repetition.uniqueWordCount} />
      </div>

      {/* ── SENTENCE LENGTH CARD ────────────────────────────────────── */}
      <Card title="Sentence Length Metrics" subtitle="Distribution and word count statistics per sentence">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MetricTile label="Mean Length" value={sentenceLength.mean} unit="words" />
          <MetricTile label="Std Deviation" value={sentenceLength.stdDev} />
          <MetricTile label="Shortest" value={sentenceLength.min} unit="words" />
          <MetricTile label="Longest" value={sentenceLength.max} unit="words" />
        </div>
      </Card>

      {/* ── SENTENCE RHYTHM CARD ────────────────────────────────────── */}
      <Card title="Sentence Rhythm Profile" subtitle="Variation pattern across consecutive sentences">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400">Variation (CV):</span>
            <span className="text-sm font-bold text-white">
              {sentenceRhythm.coefficientOfVariation}
            </span>
          </div>

          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
              sentenceRhythm.isUniformRhythm
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {sentenceRhythm.isUniformRhythm ? "⚠️ Uniform Rhythm Detected" : "✓ Natural Rhythm Variation"}
          </span>
        </div>

        {sentenceRhythm.pattern.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Sentence Sequence Pattern</span>
              <div className="flex gap-2">
                <span className="text-sky-300">■ &le;10w</span>
                <span className="text-violet-300">■ 11-24w</span>
                <span className="text-amber-300">■ &ge;25w</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800 max-h-24 overflow-y-auto">
              {sentenceRhythm.pattern.map((bucket, i) => (
                <BucketPill key={i} bucket={bucket} index={i} />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── REPETITION CARD ─────────────────────────────────────────── */}
      <Card title="Vocabulary & Phrase Repetition" subtitle="Frequency analysis of content terms and n-grams">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Overused Content Words
            </p>
            <TermTable
              terms={repetition.overusedWords}
              emptyMessage="No significantly overused content words."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Repeated 2-Word Phrases
              </p>
              <TermTable
                terms={repetition.repeatedBigrams}
                emptyMessage="No repeated bigrams."
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Repeated 3-Word Phrases
              </p>
              <TermTable
                terms={repetition.repeatedTrigrams}
                emptyMessage="No repeated trigrams."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
