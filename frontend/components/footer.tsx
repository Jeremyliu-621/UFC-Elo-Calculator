"use client"

import Link from 'next/link'
import {
    Linkedin,
    Mail,
    Github,
    FileText,
    Instagram,
    Code,
} from 'lucide-react'
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

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
]

export default function FooterSection() {
    return (
        <footer className="relative z-10 py-12 md:py-16 border-t border-gray-800/50">
            {/* Blurred background overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            
            <div className="relative mx-auto max-w-5xl px-6">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
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
                                    "relative flex flex-col items-center justify-center gap-2 rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-4 py-3 transition-all duration-300",
                                    "hover:bg-gray-800/30"
                                )}>
                                    <Icon className="size-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                                    <span className="text-xs font-light text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                        {link.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                <div className="mt-8 text-center">
                    <span className="text-gray-400 text-xs font-light" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        © {new Date().getFullYear()} Jeremy Liu. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    )
}