"use client";
import React, { ReactNode } from "react";
import { cn } from "../../libs/utils";
import { ShootingStars } from "./shooting-stars"; // ✅ make sure this path is correct

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex min-h-screen flex-col items-center justify-center text-white overflow-hidden bg-[#0b1b34]",
          className
        )}
        {...props}
      >
        {/* 🌌 Aurora Layer */}
        <div
          className="absolute inset-0 z-0"
          style={
            {
              "--aurora": `
                repeating-linear-gradient(
                  120deg,
                  #0b1b34 0%,     
                  #1e3a8a 10%,    
                  #312e81 20%,    
                  #3b82f6 30%,    
                  #22d3ee 40%,    
                  #0b1b34 50%     
                )
              `,
              "--highlight": showRadialGradient
                ? `
                  radial-gradient(
                    circle at 60% 40%,
                    rgba(139, 92, 246, 0.15), 
                    transparent 70%
                  )
                `
                : "none",
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              `pointer-events-none absolute inset-0
               animate-aurora
               [background-image:var(--aurora),var(--highlight)]
               [background-size:400%_200%]
               [background-position:50%_50%]
               opacity-60 blur-[24px] mix-blend-screen`
            )}
          />
        </div>

        {/* 🌠 Shooting Stars above Aurora */}
        <ShootingStars className="z-10" />

        {/* Foreground Content */}
        <div className="relative z-20">{children}</div>
      </div>
    </main>
  );
};
