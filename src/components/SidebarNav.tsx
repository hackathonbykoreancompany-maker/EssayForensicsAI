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
      {/* MOBILE / TABLET VIEW (<1024px): Compact top bar with collapsible navigation */}
      <div className="lg:hidden w-full surface-card rounded-xl p-4 mb-2 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-xs">
              EF
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight">
                EssayForensics <span className="text-sky-400 text-xs font-semibold">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Engine Online
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="pt-2 border-t border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => { onOpenMethodology?.(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-medium transition-colors text-left"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Linguistic Methodology &amp; Signals
            </button>
            <button
              type="button"
              onClick={() => { onOpenAbout?.(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-medium transition-colors text-left"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Platform Information
            </button>
          </nav>
        )}
      </div>

      {/* DESKTOP VIEW (≥1024px): Solid SaaS sidebar dock */}
      <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 space-y-5 surface-card rounded-2xl p-5">
        {/* Brand identity */}
        <div className="pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-sky-400 font-bold text-xs">
              EF
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight block">
                EssayForensics
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                SaaS Forensic Suite v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Primary navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Workspace
          </p>

          <a
            href="#analyzer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sky-500/10 text-sky-300 font-semibold text-xs border border-sky-500/20 transition-colors"
          >
            <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Essay Workbench</span>
          </a>

          <button
            type="button"
            onClick={onOpenMethodology}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium text-xs transition-colors text-left"
          >
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Linguistic Framework</span>
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium text-xs transition-colors text-left"
          >
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>About Platform</span>
          </button>
        </div>

        {/* Signals Overview Pill List */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Active Analyzers
          </p>
          <div className="space-y-1.5 text-[11px] text-slate-400 px-2">
            <div className="flex items-center justify-between">
              <span>Sentence Variance</span>
              <span className="text-emerald-400 font-mono text-[10px]">active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rhythm CV</span>
              <span className="text-emerald-400 font-mono text-[10px]">active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MATTR Lexical Richness</span>
              <span className="text-emerald-400 font-mono text-[10px]">active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Burstiness (Fano)</span>
              <span className="text-emerald-400 font-mono text-[10px]">active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Syntactic Complexity</span>
              <span className="text-emerald-400 font-mono text-[10px]">active</span>
            </div>
          </div>
        </div>

        {/* Telemetry card */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Statistical Model
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Calibrated Decision Engine
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Trained on 29,145 peer-reviewed academic essay samples
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
