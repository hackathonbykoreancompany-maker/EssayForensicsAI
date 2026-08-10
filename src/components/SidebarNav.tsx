"use client";

import React, { useState } from "react";

interface SidebarNavProps {
  onOpenMethodology?: () => void;
  onOpenAbout?: () => void;
}

export default function SidebarNav({ onOpenMethodology, onOpenAbout }: SidebarNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE / TABLET VIEW (<1024px): Compact top bar with collapsible menu */}
      <div className="lg:hidden w-full glass-panel rounded-2xl p-4 shadow-xl mb-2 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              Essay<span className="text-indigo-400">Forensics</span> <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 px-2 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Ready
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <button
              type="button"
              onClick={() => { onOpenMethodology?.(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 text-xs font-medium transition-colors text-left"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Framework & Signals Methodology
            </button>
            <button
              type="button"
              onClick={() => { onOpenAbout?.(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 text-xs font-medium transition-colors text-left"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About EssayForensics Platform
            </button>
          </nav>
        )}
      </div>

      {/* DESKTOP VIEW (≥1024px): Full vertical sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-4 space-y-6 glass-panel rounded-2xl p-5 shadow-xl">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">
                Essay<span className="text-indigo-400">Forensics</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Forensic Suite v2.0
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>

          <a
            href="#analyzer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-950/60 text-indigo-300 font-semibold text-xs border border-indigo-800/50 transition-colors"
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Analyzer Workbench
          </a>

          <button
            type="button"
            onClick={onOpenMethodology}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 font-medium text-xs transition-colors text-left"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Framework & Signals
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 font-medium text-xs transition-colors text-left"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About Platform
          </button>
        </nav>

        {/* Engine Status Card */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl glass-panel-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                System Engine
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-300">
              Signal Engine Active
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              6 statistical analyzers operational
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
