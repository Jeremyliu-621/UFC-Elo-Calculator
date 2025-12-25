"use client"

import { useState, useRef } from 'react';
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jmyl',
    ariaLabel: 'Visit LinkedIn profile',
  },
  {
    name: 'Email',
    href: 'mailto:jeremyliu621@gmail.com',
    ariaLabel: 'Send email',
  },
  {
    name: 'Github',
    href: 'https://github.com/Jeremyliu-621',
    ariaLabel: 'Visit GitHub profile',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/jeremyliu.621',
    ariaLabel: 'Visit Instagram profile',
  },
];

const Hero = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay before closing
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start px-4 text-center">
      {/* Fixed Gradient Background that extends */}
      <div className="fixed inset-0 -z-10">
        <AnimatedGradientBackground Breathing={true} />
      </div>

      {/* Subtle credit in top right - fixed position with blur background and dropdown */}
      <div 
        className="fixed z-50" 
        style={{ top: '1.5rem', right: 'calc(1.5rem + 8px)' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative">
          <div className="rounded-lg bg-black/40 backdrop-blur-md border border-gray-700/50 px-4 py-2 w-fit">
            <button
              className="text-gray-500/60 hover:text-gray-400/80 transition-colors duration-300 text-xs font-light cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              jeremy liu
            </button>
          </div>
          
          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute top-full right-0 mt-2 rounded-lg bg-black/40 backdrop-blur-md border border-gray-700/50 overflow-hidden transition-all duration-300 w-full",
              isDropdownOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            {socialLinks.map((link, index) => {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={link.ariaLabel}
                  className={cn(
                    "flex items-center justify-center px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/30 transition-all duration-200 whitespace-nowrap",
                    index !== socialLinks.length - 1 && "border-b border-gray-700/30"
                  )}
                  style={{
                    fontFamily: 'var(--font-montserrat)'
                  }}
                >
                  <span className="text-xs font-light">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center pt-12 md:pt-20">
        <div>
          <DotLottieReact
            src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 text-lg text-gray-300 md:text-xl max-w-lg font-light" style={{ fontFamily: 'var(--font-montserrat)' }}>
          UFC Elo Calculator - Track fighter rankings and statistics
        </p>
      </div>
      
      <div className="mt-12 md:mt-16">
        <Navbar />
      </div>
    </div>
  );
};

export default Hero;

