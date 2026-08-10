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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 tracking-tight">
                {title}
              </h2>
              <p className="text-[11px] text-stone-400">
                Evidence-Based Scientific Stylometry &amp; Signal Framework
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs leading-relaxed text-stone-300">
          <section className="space-y-1.5 p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-stone-800 text-stone-200 border border-stone-700 inline-flex items-center justify-center font-mono font-bold text-xs">1</span>
              Sentence Length Standard Deviation
            </h3>
            <p className="text-stone-400 pl-7">
              Human writers naturally alternate between concise punchy sentences and complex compound structures. Large Language Models (LLMs) tend to generate text where sentence word counts cluster tightly around a narrow mean. EssayForensics measures sentence length standard deviation across all sentences in a document to flag unnaturally uniform sentence length.
            </p>
          </section>

          <section className="space-y-1.5 p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-stone-800 text-stone-200 border border-stone-700 inline-flex items-center justify-center font-mono font-bold text-xs">2</span>
              Rhythm Uniformity (Coefficient of Variation)
            </h3>
            <p className="text-stone-400 pl-7">
              The Coefficient of Variation (CV = stdDev / mean) measures rhythm variance normalized by mean sentence length. A low CV (&lt; 0.30) indicates repetitive sentence cadence across consecutive paragraphs.
            </p>
          </section>

          <section className="space-y-1.5 p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-stone-800 text-stone-200 border border-stone-700 inline-flex items-center justify-center font-mono font-bold text-xs">3</span>
              Syntactic Complexity (Clause &amp; Punctuation Variation)
            </h3>
            <p className="text-stone-400 pl-7">
              Measures the variation in internal sentence punctuation and clause separators (commas, semicolons, dashes). AI writing exhibits remarkably uniform syntactic density per sentence.
            </p>
          </section>

          <section className="space-y-1.5 p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-stone-800 text-stone-200 border border-stone-700 inline-flex items-center justify-center font-mono font-bold text-xs">4</span>
              Burstiness (Fano Factor)
            </h3>
            <p className="text-stone-400 pl-7">
              Measures clustering of sentence length transitions across moving windows. Human discourse typically features bursts of activity followed by calmer passages, whereas AI output displays low Fano factor.
            </p>
          </section>

          <section className="space-y-1.5 p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-stone-800 text-stone-200 border border-stone-700 inline-flex items-center justify-center font-mono font-bold text-xs">5</span>
              Lexical Richness via MATTR
            </h3>
            <p className="text-stone-400 pl-7">
              Moving-Average Type-Token Ratio (MATTR) evaluates vocabulary diversity across a smooth 50-token window, eliminating text-length bias and identifying artificially broad synonym selection.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-100 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
