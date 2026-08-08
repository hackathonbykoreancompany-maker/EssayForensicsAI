import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-md shadow-indigo-500/20">
            EF
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base tracking-tight leading-none">
              Essay<span className="text-indigo-400">Forensics</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Linguistic Analysis Suite
            </span>
          </div>
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Engine Ready</span>
        </div>
      </div>
    </header>
  );
}
