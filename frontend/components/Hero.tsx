"use client"

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start px-4 pt-32 text-center">
      {/* Fixed Gradient Background that extends */}
      <div className="fixed inset-0 -z-10">
        <AnimatedGradientBackground Breathing={true} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div>
          <DotLottieReact
            src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 text-lg text-gray-300 md:text-xl max-w-lg">
          UFC Elo Calculator - Track fighter rankings and statistics
        </p>
      </div>
    </div>
  );
};

export default Hero;

