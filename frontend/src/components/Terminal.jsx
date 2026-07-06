import React, { useEffect, useRef } from "react";

export default function Terminal({ title = "console.log", logs = [] }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/95 shadow-2xl backdrop-blur-md">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800/60 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 block hover:bg-rose-600 transition"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80 block hover:bg-amber-600 transition"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 block hover:bg-emerald-600 transition"></span>
        </div>
        <div className="text-xs font-mono font-medium text-slate-400 flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {title}
        </div>
        <div className="w-12"></div> {/* Spacer for symmetry */}
      </div>

      {/* Terminal Screen */}
      <div className="p-5 h-64 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300 space-y-2 select-text custom-scrollbar">
        {logs.map((log, i) => {
          let colorClass = "text-slate-300";
          
          if (log.toLowerCase().includes("error") || log.toLowerCase().includes("failed")) {
            colorClass = "text-rose-400 font-semibold";
          } else if (log.includes("✔") || log.toLowerCase().includes("complete") || log.toLowerCase().includes("stored")) {
            colorClass = "text-emerald-400 font-medium";
          } else if (log.toLowerCase().includes("preparing") || log.toLowerCase().includes("sending")) {
            colorClass = "text-cyan-400";
          } else if (log.toLowerCase().includes("generating") || log.toLowerCase().includes("signing")) {
            colorClass = "text-violet-400";
          } else if (log.toLowerCase().includes("awaiting")) {
            colorClass = "text-slate-500 italic";
          }

          return (
            <div key={i} className={`flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]`}>
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={colorClass}>{log}</span>
            </div>
          );
        })}
        {/* Blinking Cursor */}
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-600 select-none">&gt;</span>
          <span className="w-2 h-4 bg-emerald-500 animate-[pulse_1s_infinite] inline-block"></span>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
