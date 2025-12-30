'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Legendary Hex Grid - Subtle background */}
        <path 
           d="M30 20L50 8L70 20L70 44L50 56L30 44Z" 
           stroke="currentColor" 
           strokeWidth="0.5" 
           className="text-primary/10" 
        />
        
        {/* Interconnected Neural Nodes */}
        <circle cx="50" cy="15" r="3" className="fill-primary/60" />
        <circle cx="85" cy="35" r="3" className="fill-primary/60" />
        <circle cx="85" cy="65" r="3" className="fill-primary/60" />
        <circle cx="50" cy="85" r="3" className="fill-primary/60" />
        <circle cx="15" cy="65" r="3" className="fill-primary/60" />
        <circle cx="15" cy="35" r="3" className="fill-primary/60" />
        
        {/* Sharp Connections */}
        <path 
          d="M50 15L85 35M85 35L85 65M85 65L50 85M50 85L15 65M15 65L15 35M15 35L50 15" 
          className="stroke-primary/20" 
          strokeWidth="1.5" 
        />
        
        {/* The Core Pulse - Stylized 'C' */}
        <path 
          d="M65 35C65 35 55 30 45 30C35 30 28 38 28 50C28 62 35 70 45 70C55 70 65 65 65 65" 
          className="stroke-primary animate-pulse" 
          strokeWidth="10" 
          strokeLinecap="round" 
        />
        
        {/* Center Spark */}
        <circle cx="50" cy="50" r="2" className="fill-white shadow-[0_0_10px_#fff]" />
      </svg>
      
      {/* Indigo Aura */}
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
    </div>
  );
}
