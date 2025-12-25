"use client"

import { useEffect } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface Fighter {
  fighter: string;
  value: number | string;
}

interface TablePreviewProps {
  title: string;
  data: Fighter[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TablePreview({ title, data, isOpen, onClose }: TablePreviewProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[80vh] rounded-[1.5rem] border-[0.75px] border-gray-700/50 p-3",
          "bg-black/90 backdrop-blur-md shadow-2xl",
          "transform transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GlowingEffect
          spread={20}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.7}
          borderWidth={1}
          movementDuration={2}
        />
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600/20 to-orange-600/20 px-4 py-3 rounded-t-xl border-b border-gray-700/50 flex items-center justify-between">
          <h2 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-700/30">
            {data.map((fighter, index) => (
              <div
                key={`${fighter.fighter}-${index}`}
                className="flex items-center justify-between py-2.5 px-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-light text-sm w-8">#{index + 1}</span>
                  <span className="text-gray-200 font-light text-base" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {fighter.fighter}
                  </span>
                </div>
                <span className="text-gray-300 font-light text-base" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {fighter.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

