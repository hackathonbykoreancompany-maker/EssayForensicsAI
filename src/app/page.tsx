"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import EssayInput from "../components/EssayInput";
import AnalysisResult from "../components/AnalysisResult";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";

export default function Home() {
  const [result, setResult] = useState<EssayAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze essay.");
      }

      const data: EssayAnalysisResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Sub-header banner */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Forensic Analysis Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect sentence length variance, rhythm uniformity, and content repetition
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Input */}
          <div className="lg:col-span-5">
            <EssayInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-7">
            {result ? (
              <AnalysisResult result={result} />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[420px]">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                  📊
                </div>
                <h3 className="text-sm font-semibold text-slate-300">
                  Ready for Essay Analysis
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Paste your essay text on the left and click <strong>&quot;Analyze Essay&quot;</strong> to generate forensic structural metrics and AI likelihood scoring.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Essay Forensics AI &mdash; Academic Structural Analysis Platform
      </footer>
    </div>
  );
}
