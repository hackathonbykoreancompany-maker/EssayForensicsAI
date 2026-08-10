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
        setError("An unexpected error occurred during analysis.");
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
    setModalTitle("About EssayForensics Platform");
    setIsMethodologyOpen(true);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Top Professional Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-sky-400 font-bold text-sm">
              EF
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">
                EssayForensics <span className="text-slate-400 font-normal">AI</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 border-l border-slate-800 pl-2">
                Statistical Authorship &amp; Stylometry Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Statistical Engine v2.0 &bull; Calibrated (29k corpus)</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <button 
                type="button" 
                onClick={handleOpenMethodology} 
                className="hover:text-white transition-colors"
              >
                Methodology
              </button>
              <button 
                type="button" 
                onClick={handleOpenAbout} 
                className="hover:text-white transition-colors"
              >
                Framework
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Professional Workspace */}
      <main id="analyzer" className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-sm flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-medium text-rose-300 hover:text-white px-2.5 py-1 rounded-md bg-rose-900/40 hover:bg-rose-900/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3-Column Layout: Sidebar -> Input Editor -> Analysis Results */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* COLUMN 1: Navigation & System Telemetry */}
          <SidebarNav
            onOpenMethodology={handleOpenMethodology}
            onOpenAbout={handleOpenAbout}
          />

          {/* COLUMN 2: Center Essay Input / Editor */}
          <div className="flex-1 w-full min-w-0 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Document Workspace
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Multi-signal stylometric analysis
              </span>
            </div>
            <EssayInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* COLUMN 3: Right Forensic Analysis Results Area */}
          <div className="w-full lg:w-[460px] xl:w-[520px] 2xl:w-[560px] flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Forensic Analysis
              </span>
              {result && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Analysis Complete
                </span>
              )}
            </div>

            {result ? (
              <AnalysisResult result={result} onOpenMethodology={handleOpenMethodology} />
            ) : (
              <div className="surface-card rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[480px]">
                <AnalysisEmptyStateVisual />
                
                <div className="max-w-sm space-y-1.5">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Awaiting Essay Input
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste or write text in the document workspace to evaluate sentence variance, rhythm uniformity, vocabulary diversity, and syntactic complexity.
                  </p>
                </div>

                <div className="pt-3 flex flex-wrap justify-center gap-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    Sentence Variance
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    Rhythm CV
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    MATTR Lexical Richness
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    Syntactic Complexity
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        title={modalTitle}
      />

      {/* Minimal Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 mt-12 text-xs text-slate-400">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-200">EssayForensics AI</span>
            <span>&bull;</span>
            <span>Evidence-Based Academic Stylometry Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button type="button" onClick={handleOpenMethodology} className="hover:text-slate-200 transition-colors">
              Signal Framework
            </button>
            <button type="button" onClick={handleOpenAbout} className="hover:text-slate-200 transition-colors">
              Platform Architecture
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">No Neural AI Detectors &bull; Statistical Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
