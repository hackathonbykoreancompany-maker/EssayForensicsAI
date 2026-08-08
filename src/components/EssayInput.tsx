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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full space-y-4">
      {/* Workspace Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Your Essay Workspace
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Write or paste your essay for analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setText(SAMPLE_ESSAY)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Load Sample
          </button>
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            placeholder="Paste your essay here..."
            rows={14}
            className="w-full flex-1 p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-base leading-[1.65] font-sans resize-y min-h-[300px] transition-all"
          />

          {!text && (
            <div className="pointer-events-none absolute inset-x-6 top-16 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/40">
              <span className="text-2xl mb-1">📝</span>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Ready for analysis
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
                Paste your text above or click <strong>&quot;Load Sample&quot;</strong> to see analysis in action.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions & Word/Character Count */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{wordCount}</strong> words
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{characterCount}</strong> characters
            </span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing Signals...</span>
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

