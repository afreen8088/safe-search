import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: {
      bg: "bg-slate-900/90 border-emerald-500/30 text-emerald-400",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progressBg: "bg-emerald-500",
    },
    error: {
      bg: "bg-slate-900/90 border-rose-500/30 text-rose-400",
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progressBg: "bg-rose-500",
    },
    warning: {
      bg: "bg-slate-900/90 border-amber-500/30 text-amber-400",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      progressBg: "bg-amber-500",
    },
    info: {
      bg: "bg-slate-900/90 border-blue-500/30 text-blue-400",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progressBg: "bg-blue-500",
    },
  };

  const current = colors[type] || colors.info;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex flex-col max-w-sm w-full border backdrop-blur-md rounded-xl shadow-2xl overflow-hidden animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)] ${current.bg}`}>
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{current.icon}</div>
        <div className="flex-grow">
          <p className="text-sm font-medium text-slate-100">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-100 p-0.5 rounded transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Progress Bar Animation */}
      <div className="h-1 w-full bg-slate-800">
        <div
          className={`h-full ${current.progressBg} animate-[progress_linear]`}
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  );
}
