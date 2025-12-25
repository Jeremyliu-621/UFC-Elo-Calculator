import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface AnimatedGradientBackgroundProps {
   /** 
    * Initial size of the radial gradient, defining the starting width. 
    * @default 110
    */
   startingGap?: number;

   /**
    * Enables or disables the breathing animation effect.
    * @default false
    */
   Breathing?: boolean;

   /**
    * Array of colors to use in the radial gradient.
    * Each color corresponds to a stop percentage in `gradientStops`.
    * @default ["#0A0A0A", "#2979FF", "#FF80AB", "#FF6D00", "#FFD600", "#00E676", "#3D5AFE"]
    */
   gradientColors?: string[];

   /**
    * Array of percentage stops corresponding to each color in `gradientColors`.
    * The values should range between 0 and 100.
    * @default [35, 50, 60, 70, 80, 90, 100]
    */
   gradientStops?: number[];

   /**
    * Speed of the breathing animation. 
    * Lower values result in slower animation.
    * @default 0.02
    */
   animationSpeed?: number;

   /**
    * Maximum range for the breathing animation in percentage points.
    * Determines how much the gradient "breathes" by expanding and contracting.
    * @default 5
    */
   breathingRange?: number;

   /**
    * Additional inline styles for the gradient container.
    * @default {}
    */
   containerStyle?: React.CSSProperties;

   /**
    * Additional class names for the gradient container.
    * @default ""
    */
   containerClassName?: string;


   /**
    * Additional top offset for the gradient container form the top to have a more flexible control over the gradient.
    * @default 0
    */
   topOffset?: number;
}

/**
 * AnimatedGradientBackground
 *
 * This component renders a customizable animated radial gradient background with a subtle breathing effect.
 * It uses `framer-motion` for an entrance animation and raw CSS gradients for the dynamic background.
 *
 *
 * @param {AnimatedGradientBackgroundProps} props - Props for configuring the gradient animation.
 * @returns JSX.Element
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
   startingGap = 125,
   Breathing = false,
   gradientColors = [
      "#0A0A0A",
      "#2979FF",
      "#FF80AB",
      "#FF6D00",
      "#FFD600",
      "#00E676",
      "#3D5AFE"
   ],
   gradientStops = [35, 50, 60, 70, 80, 90, 100],
   animationSpeed = 0.02,
   breathingRange = 5,
   containerStyle = {},
   topOffset = 0,
   containerClassName = "",
}) => {



   // Validation: Ensure gradientStops and gradientColors lengths match
   if (gradientColors.length !== gradientStops.length) {
      throw new Error(
         `GradientColors and GradientStops must have the same length.
     Received gradientColors length: ${gradientColors.length},
     gradientStops length: ${gradientStops.length}`
      );
   }

   const containerRef = useRef<HTMLDivElement | null>(null);
   const mousePositionRef = useRef({ x: 50, y: 20 });
   const targetPositionRef = useRef({ x: 50, y: 20 });

   // Track mouse movement
   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         // Convert mouse position to percentage (0-100)
         const x = (e.clientX / window.innerWidth) * 100;
         const y = (e.clientY / window.innerHeight) * 100;
         
         // Constrain to a very subtle range (45-55% horizontal, 18-22% vertical)
         targetPositionRef.current = {
            x: 45 + (x / 100) * 10, // Maps 0-100% mouse X to 45-55% gradient X
            y: 18 + (y / 100) * 4, // Maps 0-100% mouse Y to 18-22% gradient Y
         };
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
   }, []);

   useEffect(() => {
      let animationFrame: number;
      let width = startingGap;
      let directionWidth = 1;

      const animateGradient = () => {
         if (width >= startingGap + breathingRange) directionWidth = -1;
         if (width <= startingGap - breathingRange) directionWidth = 1;

         if (!Breathing) directionWidth = 0;
         width += directionWidth * animationSpeed;

         // Smoothly interpolate mouse position for subtle movement
         const lerpFactor = 0.03; // Lower = slower, smoother movement
         mousePositionRef.current.x += (targetPositionRef.current.x - mousePositionRef.current.x) * lerpFactor;
         mousePositionRef.current.y += (targetPositionRef.current.y - mousePositionRef.current.y) * lerpFactor;

         const gradientStopsString = gradientStops
            .map((stop, index) => `${gradientColors[index]} ${stop}%`)
            .join(", ");

         const gradient = `radial-gradient(${width}% ${width+topOffset}% at ${mousePositionRef.current.x}% ${mousePositionRef.current.y}%, ${gradientStopsString})`;

         if (containerRef.current) {
            containerRef.current.style.background = gradient;
         }

         animationFrame = requestAnimationFrame(animateGradient);
      };

      animationFrame = requestAnimationFrame(animateGradient);

      return () => cancelAnimationFrame(animationFrame); // Cleanup animation
   }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

   return (
      <motion.div
         key="animated-gradient-background"
         initial={{
            opacity: 0,
            scale: 1.5,
         }}
         animate={{
            opacity: 1,
            scale: 1,
            transition: {
               duration: 2,
               ease: [0.25, 0.1, 0.25, 1], // Cubic bezier easing
             },
         }}
         className={`absolute inset-0 overflow-hidden ${containerClassName}`}
      >
         <div
            ref={containerRef}
            style={containerStyle}
            className="absolute inset-0 transition-transform"
         />
      </motion.div>
   );
};

export default AnimatedGradientBackground;