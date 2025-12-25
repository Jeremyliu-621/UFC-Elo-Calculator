"use client"

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const navItems = [
  { label: 'Top 100 Fighters', href: '#elo' },
  { label: 'Ws/STRs/TDs/SUBs', href: '#stats' },
  { label: 'Search for Fighters', href: '#search' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['elo', 'stats', 'search'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="relative z-20 w-full py-8 md:py-10">
      <div className="flex items-center justify-center">
        {/* Rounded-square container */}
        <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-gray-700/50 shadow-lg px-4 py-4 md:px-5 md:py-4">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            {navItems.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer group",
                    "hover:scale-105",
                    isActive && "border-red-600/50"
                  )}
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
                  <div className={cn(
                    "relative flex items-center justify-center rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-5 py-2.5 md:px-6 md:py-3 transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-r from-red-600/20 to-orange-600/20" 
                      : "hover:bg-gray-800/30"
                  )}>
                    <span
                      className={cn(
                        "text-sm md:text-base font-light transition-colors duration-300",
                        isActive
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      )}
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

