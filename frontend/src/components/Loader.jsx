import React from "react";

export function Spinner({ size = "md", text }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className={`rounded-full border-slate-700/60 ${selectedSize}`}></div>
        <div
          className={`absolute inset-0 rounded-full border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin ${selectedSize}`}
        ></div>
      </div>
      {text && <p className="text-sm font-mono text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-full bg-slate-900/40 border border-slate-850 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-800 rounded w-1/4"></div>
        <div className="h-5 bg-slate-800 rounded-full w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="h-6 bg-slate-800 rounded-full w-16"></div>
        <div className="h-6 bg-slate-800 rounded-full w-20"></div>
        <div className="h-6 bg-slate-800 rounded-full w-14"></div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-2 animate-pulse"
        >
          <div className="h-3 bg-slate-800 rounded w-1/3"></div>
          <div className="h-8 bg-slate-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function LoadingOverlay({ text }) {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center rounded-xl transition-all duration-300">
      <Spinner size="lg" text={text || "Processing secure request..."} />
    </div>
  );
}
