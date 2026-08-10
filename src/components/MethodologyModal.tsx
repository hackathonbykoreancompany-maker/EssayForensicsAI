"use client";

import React, { useEffect } from "react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function MethodologyModal({ isOpen, onClose, title = "Linguistic Analysis Methodology" }: MethodologyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evidence-Based Scientific Framework & Signals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 inline-flex items-center justify-center font-mono font-bold text-xs">1</span>
              Sentence Length Standard Deviation
            </h3>
            <p>
              Human writers naturally alternate between concise punchy sentences and complex compound structures. Large Language Models (LLMs) tend to generate text where sentence word counts cluster tightly around a narrow mean. EssayForensics measures sentence length standard deviation across all sentences in a document to flag unnaturally uniform sentence length.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 inline-flex items-center justify-center font-mono font-bold text-xs">2</span>
              Rhythm Uniformity (Coefficient of Variation)
            </h3>
            <p>
              The Coefficient of Variation (CV = stdDev / mean) measures rhythm variance normalized by mean sentence length. A low CV (&lt; 0.25) indicates repetitive sentence cadence across consecutive paragraphs.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 inline-flex items-center justify-center font-mono font-bold text-xs">3</span>
              N-gram & Phrase Repetition Analysis
            </h3>
            <p>
              AI models frequently over-index on specific transitional phrases (e.g., <em>&quot;educational methodologies&quot;</em>, <em>&quot;unprecedented scalability&quot;</em>) and recurring 2-word (bigram) or 3-word (trigram) combinations. We analyze tokenized term frequencies to highlight overused vocabulary.
            </p>
          </section>

          <section className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Why Explainability Matters
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Unlike black-box AI detectors that output unexplainable percentages, EssayForensics provides passage-level evidence so educators and evaluators can inspect exactly <strong>where</strong> and <strong>why</strong> a passage displays structural AI indicators.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
}
