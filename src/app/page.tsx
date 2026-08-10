"use client";

import { useState } from "react";
import SidebarNav from "../components/SidebarNav";
import EssayInput from "../components/EssayInput";
import AnalysisResult from "../components/AnalysisResult";
import MethodologyModal from "../components/MethodologyModal";
import AnalysisEmptyStateVisual from "../components/AnalysisEmptyStateVisual";
import type { EssayAnalysisResult } from "../services/essayAnalysisService";

export default function Home() {
  const [result, setResult] = useState<EssayAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Linguistic Analysis Methodology");

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

  const handleOpenMethodology = () => {
    setModalTitle("Linguistic Analysis Methodology");
    setIsMethodologyOpen(true);
  };

  const handleOpenAbout = () => {
    setModalTitle("About EssayForensics AI");
    setIsMethodologyOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar / Header */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Linguistic Forensic Workspace
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button type="button" onClick={handleOpenMethodology} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Methodology
            </button>
            <button type="button" onClick={handleOpenAbout} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workspace Container */}
      <main id="analyzer" className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 px-2.5 py-1 rounded-lg bg-rose-100/60 dark:bg-rose-900/40 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3-COLUMN FUTURISTIC GRID LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* COLUMN 1: Minimal Left Navigation */}
          <SidebarNav
            onOpenMethodology={handleOpenMethodology}
            onOpenAbout={handleOpenAbout}
          />

          {/* COLUMN 2: Large Essay Paste/Write Area (Center) */}
          <div className="flex-1 w-full space-y-3 lg:sticky lg:top-20">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                Input Workspace
              </h2>
            </div>
            <EssayInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* COLUMN 3: Analysis / Result Area (Right) */}
          <div className="w-full lg:w-[480px] xl:w-[540px] 2xl:w-[600px] flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                Forensic Analysis
              </h2>
            </div>
            {result ? (
              <AnalysisResult result={result} onOpenMethodology={handleOpenMethodology} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-6 md:p-10 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px] shadow-xs overflow-hidden">
                <AnalysisEmptyStateVisual />
                <div className="max-w-xs space-y-1.5 relative z-10">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Ready to analyze your essay
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Paste your essay in the center workspace and click <strong>&quot;Analyze Essay&quot;</strong> to generate forensic evidence.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ✓ Sentence Patterns
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ✓ Vocabulary & Repetition
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ✓ Structural Rhythm
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Methodology Drawer Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        title={modalTitle}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 mt-8">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
            <span>EssayForensics AI</span>
            <span>&mdash; Academic Linguistic Analysis Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <button type="button" onClick={handleOpenMethodology} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Methodology
            </button>
            <button type="button" onClick={handleOpenAbout} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About Signals
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
