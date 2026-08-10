"use client";

import React, { useState } from "react";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";
import type { RepeatedTerm } from "../services/signals/repetition";
import type { SentenceLengthBucket } from "../services/signals/sentenceRhythm";

interface AdvancedAnalysisProps {
  result: EssayAnalysisResult;
}

const BUCKET_STYLES: Record<SentenceLengthBucket, string> = {
  short: "bg-sky-950/60 text-sky-300 border-sky-800/60",
  medium: "bg-slate-800/80 text-slate-200 border-slate-700/60",
  long: "bg-amber-950/60 text-amber-300 border-amber-800/60",
};

function BucketPill({ bucket, index }: { bucket: SentenceLengthBucket; index: number }) {
  return (
    <span
      className={`inline-block w-3.5 h-3.5 rounded-sm border ${BUCKET_STYLES[bucket]}`}
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

function StatRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-b-0">
      <span className="text-[12px] text-slate-400 font-medium">{label}</span>
      <span className="text-[12px] text-white font-semibold">
        {value}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 pb-1 border-b border-slate-800">
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function AdvancedAnalysis({ result }: AdvancedAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { sentenceLength, sentenceRhythm, repetition, burstiness, lexicalDiversity, sentenceComplexity, score } = result;

  const breakdownItems = [
    { name: "Syntactic Complexity", value: score.breakdown.sentenceComplexityScore, max: 30, color: "bg-sky-500" },
    { name: "Sentence Burstiness", value: score.breakdown.burstinessScore, max: 20, color: "bg-teal-500" },
    { name: "Lexical Diversity (MATTR)", value: score.breakdown.lexicalDiversityScore, max: 20, color: "bg-indigo-500" },
    { name: "Length Variance", value: score.breakdown.sentenceLengthScore, max: 15, color: "bg-amber-500" },
    { name: "Cadence Uniformity", value: score.breakdown.sentenceRhythmScore, max: 15, color: "bg-rose-500" },
  ];

  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Detailed Statistical Breakdown
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            View granular stylometric metrics, vocabulary distribution, and score contributions
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
          <SubSection title="1. Sentence Length Distribution">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Mean Length", value: sentenceLength.mean, unit: "words" },
                { label: "Std Deviation", value: sentenceLength.stdDev, unit: "words" },
                { label: "Minimum", value: sentenceLength.min, unit: "words" },
                { label: "Maximum", value: sentenceLength.max, unit: "words" },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-base font-bold text-white leading-none mt-1 block">{stat.value}</span>
                  <span className="text-[10px] text-slate-400">{stat.unit}</span>
                </div>
              ))}
            </div>
            {sentenceLength.lengths.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Per-sentence word count sequence</p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  {sentenceLength.lengths.map((len, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {len}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SubSection>

          {/* B. Rhythm Analysis */}
          <SubSection title="2. Rhythm &amp; Cadence Profile">
            <StatRow label="Coefficient of Variation (CV)" value={sentenceRhythm.coefficientOfVariation} />
            <StatRow label="Cadence Profile" value={sentenceRhythm.isUniformRhythm ? "Uniform (AI marker)" : "Natural Variation"} />
            {sentenceRhythm.pattern.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="font-medium">Sentence Sequence Pattern</span>
                  <div className="flex gap-2 font-mono">
                    <span className="text-sky-300">&le;10w (Short)</span>
                    <span className="text-slate-300">11-24w (Medium)</span>
                    <span className="text-amber-300">&ge;25w (Long)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-slate-900/80 border border-slate-800 max-h-20 overflow-y-auto">
                  {sentenceRhythm.pattern.map((bucket, i) => (
                    <BucketPill key={i} bucket={bucket} index={i} />
                  ))}
                </div>
              </div>
            )}
          </SubSection>

          {/* C. Repetition Analysis */}
          <SubSection title="3. Vocabulary &amp; Phrase Repetition">
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
            </div>
          </SubSection>

          {/* D. Burstiness & Lexical Diversity */}
          <SubSection title="4. Burstiness &amp; Lexical Diversity">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Burstiness (Fano Factor)</p>
                <StatRow label="Score (normalized)" value={burstiness.score} />
                <StatRow label="Fano Factor" value={burstiness.fanoFactor} />
                <StatRow label="Low Burstiness Flag" value={burstiness.isLowBurstiness ? "Yes" : "No"} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MATTR Vocabulary Richness</p>
                <StatRow label="MATTR Score" value={lexicalDiversity.mattr} />
                <StatRow label="Elevated Diversity Flag" value={lexicalDiversity.isHighMattr ? "Yes" : "No"} />
                <StatRow label="Total Token Count" value={lexicalDiversity.tokenCount} />
              </div>
            </div>
          </SubSection>

          {/* E. Syntactic Complexity */}
          <SubSection title="5. Syntactic Complexity">
            <StatRow label="Complexity Variation (CV)" value={sentenceComplexity.complexityCV} />
            <StatRow label="Mean Syntactic Density" value={sentenceComplexity.meanDensity} />
            <StatRow label="Uniform Complexity Flag" value={sentenceComplexity.isUniformComplexity ? "Yes" : "No"} />
          </SubSection>

          {/* F. Signal Contribution Summary */}
          <SubSection title="6. Signal Score Weights Breakdown">
            <div className="space-y-2">
              {breakdownItems.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-300 font-medium w-40 flex-shrink-0">{item.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white w-10 text-right">
                    +{item.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-1">
                <span className="text-xs font-bold text-slate-300">Composite Score</span>
                <span className="text-sm font-extrabold text-white">{score.overallScore}%</span>
              </div>
            </div>
          </SubSection>
        </div>
      )}
    </div>
  );
}
