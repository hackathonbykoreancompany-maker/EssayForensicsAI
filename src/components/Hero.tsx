"use client";

import React, { useEffect, useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      // Only apply if user does not prefer reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const scrollY = window.scrollY;
      // Fade out slowly, maximum fade out at 400px scroll
      const opacity = Math.max(0, 1 - scrollY / 400);
      // Move up slightly, maximum 40px
      const translateY = Math.min(40, scrollY * 0.2);

      heroRef.current.style.setProperty('--scroll-opacity', opacity.toString());
      heroRef.current.style.setProperty('--scroll-translate', `-${translateY}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="w-full py-8 md:py-10 text-center px-4 sm:px-6 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors will-change-[opacity,transform] motion-safe:opacity-[var(--scroll-opacity,1)] motion-safe:[transform:translateY(var(--scroll-translate,0px))]"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Academic pill badge */}
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs motion-safe:animate-[hero-fade-up_0.8s_ease-out_forwards] motion-safe:opacity-0"
        >
          <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span>Evidence-Based Essay Analysis</span>
        </div>

        <h1 className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] font-sans mx-auto max-w-3xl flex flex-col items-center">
          <span 
            className="block motion-safe:animate-[hero-fade-up_0.8s_ease-out_forwards] motion-safe:opacity-0"
            style={{ animationDelay: '150ms' }}
          >
            Understand the writing
          </span>
          <span 
            className="block text-indigo-600 dark:text-indigo-400 motion-safe:animate-[hero-fade-up_0.8s_ease-out_forwards] motion-safe:opacity-0"
            style={{ animationDelay: '300ms' }}
          >
            behind your essay.
          </span>
        </h1>

        <p 
          className="text-lg sm:text-[19px] text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium motion-safe:animate-[hero-fade-up_0.8s_ease-out_forwards] motion-safe:opacity-0"
          style={{ animationDelay: '450ms' }}
        >
          See which parts of an essay look unusual — and understand why.
        </p>

        <div 
          className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium motion-safe:animate-[hero-fade-up_0.8s_ease-out_forwards] motion-safe:opacity-0"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Sentence Patterns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Vocabulary & Repetition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Passage-Level Evidence</span>
          </div>
        </div>
      </div>
    </section>
  );
}

