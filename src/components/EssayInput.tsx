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
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-sm flex flex-col h-full">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Input Essay Text
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste essay for forensic structural inspection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setText(SAMPLE_ESSAY)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 transition-colors"
          >
            Load Sample
          </button>
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your essay text here..."
          rows={14}
          className="w-full flex-1 p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm leading-relaxed font-mono resize-y min-h-[260px]"
        />

        {/* Footer Info & Action */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span>
              <strong className="text-slate-200">{wordCount}</strong> words
            </span>
            <span className="text-slate-700">•</span>
            <span>
              <strong className="text-slate-200">{characterCount}</strong> chars
            </span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze Essay →</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
