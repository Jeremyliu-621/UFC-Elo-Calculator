"use client"

import { cn } from "@/lib/utils";

interface CodeDisplayProps {
  code: string;
  language?: string;
  className?: string;
}

export default function CodeDisplay({ code, language = "python", className }: CodeDisplayProps) {
  return (
    <div className={cn("relative rounded-xl border-[0.75px] border-gray-700/50 bg-gray-900/60 backdrop-blur-sm overflow-hidden", className)}>
      {/* Jupyter notebook style header */}
      <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
        </div>
        <span className="text-xs text-gray-400 font-light ml-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          {language}
        </span>
      </div>
      
      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-gray-200 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

