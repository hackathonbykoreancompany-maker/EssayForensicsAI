"use client";

import React, { useState } from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { RepeatedTerm } from "../services/signals/repetition";
import type { SentenceLengthBucket } from "../services/signals/sentenceRhythm";

interface AdvancedAnalysisProps {
  result: EssayAnalysisResult;
}

/* ── Shared sub-components ─── */

const BUCKET_STYLES: Record<SentenceLengthBucket, string> = {
  short: "bg-sky-950/50 text-sky-300 border-sky-800/40",
  medium: "bg-violet-950/50 text-violet-300 border-violet-800/40",
  long: "bg-amber-950/50 text-amber-300 border-amber-800/40",
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
    return <p className="text-xs text-slate-400 italic py-1">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <th className="pb-1.5 font-semibold">Term</th>
            <th className="pb-1.5 font-semibold text-right">Count</th>
            <th className="pb-1.5 font-semibold text-right">Freq</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {terms.slice(0, 8).map((t) => (
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

/* ── Stat row helper ─── */
function StatRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-b-0">
      <span className="text-[12px] text-slate-400 font-medium">{label}</span>
      <span className="text-[13px] text-white font-semibold">
        {value}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

/* ── Subsection wrapper ─── */
function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ── Main component ─── */

export default function AdvancedAnalysis({ result }: AdvancedAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { sentenceLength, sentenceRhythm, repetition, burstiness, lexicalDiversity, sentenceComplexity, score } = result;

  // Signal breakdown for score contribution chart
  const breakdownItems = [
    { name: "Sentence Complexity", value: score.breakdown.sentenceComplexityScore, max: 30, color: "bg-violet-500" },
    { name: "Burstiness", value: score.breakdown.burstinessScore, max: 20, color: "bg-sky-500" },
    { name: "Lexical Diversity", value: score.breakdown.lexicalDiversityScore, max: 20, color: "bg-indigo-500" },
    { name: "Sentence Length", value: score.breakdown.sentenceLengthScore, max: 15, color: "bg-amber-500" },
    { name: "Sentence Rhythm", value: score.breakdown.sentenceRhythmScore, max: 15, color: "bg-rose-500" },
    { name: "Repetition", value: score.breakdown.repetitionScore, max: 0, color: "bg-slate-600" },
  ];

  return (
    <div className="rounded-2xl glass-panel shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div>
          <h3 className="text-[14px] font-bold text-white tracking-tight">
            Advanced Analysis
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Technical evidence and statistical breakdown
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-6 border-t border-slate-800/80 pt-4">
          {/* A. Sentence Length Analysis */}
          <SubSection title="A. Sentence Length Analysis">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Mean", value: sentenceLength.mean, unit: "words" },
                { label: "Std Dev", value: sentenceLength.stdDev, unit: "words" },
                { label: "Min", value: sentenceLength.min, unit: "words" },
                { label: "Max", value: sentenceLength.max, unit: "words" },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-lg glass-panel-subtle text-center">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-[18px] font-bold text-white leading-none mt-1 block">{stat.value}</span>
                  <span className="text-[10px] text-slate-400">{stat.unit}</span>
                </div>
              ))}
            </div>
            {sentenceLength.lengths.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Per-sentence lengths</p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg glass-panel-subtle">
                  {sentenceLength.lengths.map((len, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                      {len}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SubSection>

          {/* B. Rhythm Analysis */}
          <SubSection title="B. Rhythm Analysis">
            <StatRow label="Coefficient of Variation (CV)" value={sentenceRhythm.coefficientOfVariation} />
            <StatRow label="Rhythm Classification" value={sentenceRhythm.isUniformRhythm ? "Uniform" : "Natural"} />
            {sentenceRhythm.pattern.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="font-medium">Sentence Sequence Pattern</span>
                  <div className="flex gap-2 font-mono">
                    <span className="text-sky-300">■ ≤10w</span>
                    <span className="text-violet-300">■ 11-24w</span>
                    <span className="text-amber-300">■ ≥25w</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 p-2 rounded-lg glass-panel-subtle max-h-20 overflow-y-auto">
                  {sentenceRhythm.pattern.map((bucket, i) => (
                    <BucketPill key={i} bucket={bucket} index={i} />
                  ))}
                </div>
              </div>
            )}
          </SubSection>

          {/* C. Repetition Analysis */}
          <SubSection title="C. Repetition Analysis">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Overused Content Words ({repetition.uniqueWordCount} unique tokens)
                </p>
                <TermTable terms={repetition.overusedWords} emptyMessage="No overused content words detected." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Repeated Bigrams</p>
                  <TermTable terms={repetition.repeatedBigrams} emptyMessage="None" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Repeated Trigrams</p>
                  <TermTable terms={repetition.repeatedTrigrams} emptyMessage="None" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <StatRow label="Bigram Diversity" value={repetition.bigramDiversityRatio} />
                <StatRow label="Phrase Repetition Rate" value={repetition.phraseRepetitionRate} />
              </div>
            </div>
          </SubSection>

          {/* D. Burstiness & Lexical Diversity */}
          <SubSection title="D. Burstiness & Vocabulary">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Burstiness</p>
                <StatRow label="Score (normalized)" value={burstiness.score} />
                <StatRow label="Fano Factor" value={burstiness.fanoFactor} />
                <StatRow label="Low Burstiness?" value={burstiness.isLowBurstiness ? "Yes" : "No"} />
                <StatRow label="Sentences" value={burstiness.sentenceCount} />
              </div>
              <div className="space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lexical Diversity</p>
                <StatRow label="MATTR" value={lexicalDiversity.mattr} />
                <StatRow label="High MATTR?" value={lexicalDiversity.isHighMattr ? "Yes" : "No"} />
                <StatRow label="Tokens" value={lexicalDiversity.tokenCount} />
                <StatRow label="Window Size" value={lexicalDiversity.windowSize} />
              </div>
            </div>
          </SubSection>

          {/* E. Sentence Complexity */}
          <SubSection title="E. Sentence Complexity">
            <StatRow label="Complexity CV" value={sentenceComplexity.complexityCV} />
            <StatRow label="Mean Density" value={sentenceComplexity.meanDensity} />
            <StatRow label="Uniform Complexity?" value={sentenceComplexity.isUniformComplexity ? "Yes" : "No"} />
            <StatRow label="Sentences Analyzed" value={sentenceComplexity.sentenceCount} />
          </SubSection>

          {/* F. Signal Score Breakdown */}
          <SubSection title="F. Signal Score Breakdown">
            <div className="space-y-2">
              {breakdownItems.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-300 font-medium w-36 flex-shrink-0">{item.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: item.max > 0 ? `${(item.value / item.max) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-white w-10 text-right">
                    +{item.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-1">
                <span className="text-[12px] font-bold text-slate-300">Total Score</span>
                <span className="text-[15px] font-extrabold text-white">{score.overallScore}%</span>
              </div>
            </div>
          </SubSection>
        </div>
      )}
    </div>
  );
}
