"use client"

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start px-4 text-center">
      {/* Fixed Gradient Background that extends */}
      <div className="fixed inset-0 -z-10">
        <AnimatedGradientBackground Breathing={true} />
      </div>

      {/* Subtle credit in top right - fixed position */}
      <div className="fixed z-50" style={{ top: '1.5rem', right: 'calc(1.5rem + 8px)' }}>
        <Link
          href="https://github.com/Jeremyliu-621"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500/60 hover:text-gray-400/80 transition-colors duration-300 text-xs font-light"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          jeremy liu
        </Link>
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

