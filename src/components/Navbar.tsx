"use client";

import React from "react";
import Link from "next/link";

interface NavbarProps {
  onOpenMethodology?: () => void;
  onOpenAbout?: () => void;
}

export default function Navbar({ onOpenMethodology, onOpenAbout }: NavbarProps) {
  return (
    <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-[1.02] transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Essay<span className="text-indigo-600 dark:text-indigo-400">Forensics</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                AI
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Evidence-Based Writing Analysis
            </span>
          </div>
        </Link>

        {/* Navigation & Engine Status */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-2 text-[15px] font-medium">
            <a
              href="#analyzer"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Analyzer
            </a>
            <button
              type="button"
              onClick={onOpenMethodology}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Methodology
            </button>
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Engine Ready
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

