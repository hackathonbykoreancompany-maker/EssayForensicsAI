"use client";

import React, { useState } from "react";

interface EssayInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_ESSAY = `Artificial intelligence has transformed modern educational methodologies across global institutions. The implementation of automated evaluation systems provides unprecedented scalability in academic assessment. Furthermore, machine learning models continue to demonstrate remarkable proficiency in natural language processing tasks. However, critical thinking remains a uniquely human capability that requires dedicated pedagogical cultivation. Educational frameworks must evolve synchronously with technological advancements to ensure comprehensive learning outcomes. In conclusion, integrating technological tools with human oversight creates an optimal paradigm for future academic success.`;

export default function EssayInput({ onAnalyze, isLoading }: EssayInputProps) {
  const [text, setText] = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAnalyze(text);
    }
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 flex flex-col h-full space-y-4">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Essay Text Editor
            </h2>
            <p className="text-[11px] text-slate-400">
              Input student essay or academic document
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setText(SAMPLE_ESSAY)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Load Sample</span>
          </button>
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Editor Box */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
        <div className="relative flex-1 flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your essay here for statistical stylometry and authorship inspection..."
            rows={15}
            className="w-full flex-1 p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/60 text-sm sm:text-base leading-relaxed font-sans resize-y min-h-[460px] transition-colors"
          />

          {!text && (
            <div className="pointer-events-none absolute inset-x-6 top-20 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/90 rounded-xl bg-slate-950/40">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-300">
                Ready for Analysis
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Paste an essay or click <strong>&quot;Load Sample&quot;</strong> to evaluate linguistic variance.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions & Word/Character Count */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <strong className="text-white font-semibold">{wordCount}</strong> words
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white font-semibold">{characterCount}</strong> characters
            </span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Evaluating Signals...</span>
              </>
            ) : (
              <>
                <span>Analyze Essay</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
