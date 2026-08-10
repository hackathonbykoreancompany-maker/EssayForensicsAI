"use client";

import React, { useState } from "react";

interface EssayInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export default function EssayInput({ onAnalyze, isLoading }: EssayInputProps) {
  const [text, setText] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characterCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 0 && !isLoading) {
      onAnalyze(text);
    }
  };

  const handleClear = () => {
    setText("");
  };

  const handlePasteSample = () => {
    const sampleText = `Linguistic analysis plays a pivotal role in understanding stylistic consistency across academic texts. Recent advancements in computational linguistics have enabled automated systems to evaluate syntax patterns, vocabulary diversity, and structural rhythm with remarkable precision. By analyzing variations in sentence length and structural cadence, evaluators can gain deeper insights into the underlying characteristics of a written passage.`;
    setText(sampleText);
  };

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
            Essay Workspace
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePasteSample}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            Load Sample
          </button>
          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div className="relative flex-1">
          {/* Fix 1 & Fix 3: min-h-[460px] and darker overlay (bg-slate-950/80) strictly inside textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your essay here to analyze linguistic evidence and writing patterns..."
            rows={18}
            className="w-full h-full min-h-[460px] p-4 rounded-xl bg-slate-950/80 text-slate-100 placeholder-slate-500 text-sm leading-relaxed border border-slate-800/80 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none resize-y transition-all font-sans"
          />
        </div>

        {/* Footer & Submit */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span>{wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>{characterCount.toLocaleString()} characters</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || text.trim().length === 0}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-900/30 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing Essay...
              </>
            ) : (
              <>
                Analyze Essay
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
