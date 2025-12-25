"use client"

import { Download } from 'lucide-react';
import {
    Linkedin,
    Mail,
    Github,
    FileText,
    Instagram,
    Code,
} from 'lucide-react'
import Link from 'next/link';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

const csvFiles = [
  { name: "Current Fighters Elo", file: "current_fighters_elo.csv" },
  { name: "Fighter Statistics", file: "fighter_stats.csv" },
  { name: "All UFC Fights", file: "all_ufc_fights.csv" },
  { name: "UFC Fights with Elo", file: "ufc_fights_with_elo.csv" },
];

const socialLinks = [
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/jmyl',
        icon: Linkedin,
        ariaLabel: 'Visit LinkedIn profile',
    },
    {
        name: 'Email',
        href: 'mailto:jeremyliu621@gmail.com',
        icon: Mail,
        ariaLabel: 'Send email',
    },
    {
        name: 'Github',
        href: 'https://github.com/Jeremyliu-621',
        icon: Github,
        ariaLabel: 'Visit GitHub profile',
    },
    {
        name: 'Resume',
        href: './assets/Jeremy_Liu_final_resume.pdf',
        icon: FileText,
        ariaLabel: 'View resume',
    },
    {
        name: 'Instagram',
        href: 'https://instagram.com/jeremyliu.621',
        icon: Instagram,
        ariaLabel: 'Visit Instagram profile',
    },
    {
        name: 'Devpost',
        href: 'https://devpost.com/jeremyliu621',
        icon: Code,
        ariaLabel: 'Visit Devpost profile',
    },
];

export default function DownloadsSocials() {
  return (
    <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-4xl space-y-12">
        {/* CSV Downloads Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-white text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Download Data as CSV
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {csvFiles.map((csv) => (
              <a
                key={csv.file}
                href={`/${csv.file}`}
                download
                className="group relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer hover:scale-105 w-full"
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
                  "relative flex items-center justify-center gap-3 rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-5 py-3 transition-all duration-300",
                  "hover:bg-gray-800/30"
                )}>
                  <Download className="size-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <span className="text-sm font-light text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {csv.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Social Links Section - Pill Style */}
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Connect With Me
          </h2>
          
          <div className="relative rounded-full border-[0.75px] border-gray-700/50 p-2 bg-black/40 backdrop-blur-md">
            <div className="flex flex-wrap justify-center gap-3 px-4 py-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith('http') || link.href.startsWith('./') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={link.ariaLabel}
                    className="group relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer hover:scale-105"
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
                      "relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-4 py-2.5 transition-all duration-300",
                      "hover:bg-gray-800/30"
                    )}>
                      <Icon className="size-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                      <span className="text-xs font-light text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {link.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

