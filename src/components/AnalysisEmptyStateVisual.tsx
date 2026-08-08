"use client";

import React, { useEffect, useState } from "react";

export default function AnalysisEmptyStateVisual() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    // Optional subtle parallax interaction
    const handleMouseMove = (e: MouseEvent) => {
      // Only apply on desktop
      if (window.innerWidth > 768) {
        // Calculate normalized mouse position (-1 to 1)
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePos({ x, y });
      }
    };
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch for motion preference

  // Subtle interactive rotation (max 5 degrees)
  const interactiveTransform = `rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`;

  return (
    <div className="relative w-full h-[140px] sm:h-[160px] flex items-center justify-center overflow-hidden [perspective:1000px] mb-2 pointer-events-none">
      
      {/* Container for the 3D scene */}
      <div 
        className="relative flex items-center justify-center w-full h-full transition-transform duration-700 ease-out [transform-style:preserve-3d]"
        style={{ transform: interactiveTransform }}
      >
        
        {/* Background glow / shadow */}
        <div className="absolute w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl motion-reduce:hidden" />
        
        {/* Orbital lines */}
        <div className="absolute w-40 h-40 border border-slate-200/40 dark:border-slate-700/40 rounded-full [transform:rotateX(75deg)] motion-safe:animate-[pulse-opacity_4s_ease-in-out_infinite] motion-reduce:hidden" />
        <div className="absolute w-56 h-56 border border-slate-200/20 dark:border-slate-800/60 rounded-full [transform:rotateX(75deg)_rotateY(10deg)] motion-safe:animate-[pulse-opacity_6s_ease-in-out_infinite_1s] motion-reduce:hidden" />
        
        {/* Orbiting nodes (data points) */}
        <div className="absolute w-full h-full flex items-center justify-center [transform-style:preserve-3d] motion-safe:animate-[orbit-slow_12s_linear_infinite] motion-reduce:hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        </div>
        
        <div className="absolute w-full h-full flex items-center justify-center [transform-style:preserve-3d] motion-safe:animate-[orbit-slower_18s_linear_infinite] motion-reduce:hidden">
          <div className="w-1 h-1 rounded-full bg-emerald-400 dark:bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
        </div>

        {/* Central Document Object */}
        <div className="relative w-[110px] sm:w-[130px] h-[140px] sm:h-[160px] motion-safe:animate-[float-doc-mobile_6s_ease-in-out_infinite] sm:motion-safe:animate-[float-doc_8s_ease-in-out_infinite] [transform-style:preserve-3d]">
          
          {/* Document Base (Glass) */}
          <div className="absolute inset-0 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/60 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] [transform:translateZ(0px)] flex flex-col gap-2.5 p-3.5 pt-4">
            
            {/* Header block */}
            <div className="w-3/4 h-2 rounded bg-slate-200/80 dark:bg-slate-700/80" />
            
            {/* Paragraph blocks */}
            <div className="space-y-1.5">
              <div className="w-full h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
              <div className="w-[90%] h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
              <div className="w-[95%] h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
              <div className="w-2/3 h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
            </div>
            
            <div className="space-y-1.5 mt-1">
              <div className="w-full h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
              <div className="w-4/5 h-1.5 rounded bg-slate-200/60 dark:bg-slate-700/60" />
            </div>
            
            {/* Analysis Overlay Highlights (translateZ for depth) */}
            <div className="absolute top-[3.75rem] left-3.5 w-1/2 h-2 rounded bg-indigo-500/30 dark:bg-indigo-400/30 [transform:translateZ(8px)] blur-[1px]" />
            <div className="absolute top-[6.25rem] left-3.5 w-[40%] h-2 rounded bg-emerald-500/30 dark:bg-emerald-400/30 [transform:translateZ(6px)] blur-[1px]" />
            
          </div>
          
          {/* Analysis Reticle / Scanner element hovering above document */}
          <div className="absolute -right-2 top-10 w-16 h-16 border border-indigo-400/30 dark:border-indigo-400/20 rounded-full [transform:translateZ(20px)] flex items-center justify-center">
             <div className="w-2 h-2 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
             
             {/* Reticle brackets */}
             <div className="absolute inset-0 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-lg w-3 h-3 top-1 left-1" />
             <div className="absolute inset-0 border-b-2 border-r-2 border-indigo-500/40 rounded-br-lg w-3 h-3 bottom-1 right-1" />
          </div>
          
        </div>
      </div>
    </div>
  );
}
