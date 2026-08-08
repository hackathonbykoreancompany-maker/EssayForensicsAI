import React from "react";

export default function Hero() {
  return (
    <section className="w-full py-16 md:py-24 text-center px-6 border-b border-slate-900 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/50">
          <span>🔬</span> Linguistic Pattern Analysis
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Forensic Essay Analysis for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            Academic Integrity
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Uncover structural patterns, sentence length variance, and vocabulary repetition in essays with precise, explainable metrics.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <a
            href="#analyze"
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Start Analysis ↓
          </a>
        </div>
      </div>
    </section>
  );
}
