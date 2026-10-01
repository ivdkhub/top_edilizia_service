"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Adapted from Shadcn Space FocusFrameBorder (MIT).
// https://github.com/shadcnspace/shadcnspace/blob/main/src/components/shadcn-space/shine-border/shine-border-06.tsx
// License: licenses/shadcnspace-MIT.txt. Styles are scoped in app/services-cards.css.
export interface ShineBorder06Props {
  children: ReactNode;
  className?: string;
  duration?: number;
  color?: string;
}

const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];

export default function ShineBorder06({
  children,
  className,
  duration = 2.4,
  color = "var(--color-blue-500)",
}: ShineBorder06Props) {
  return (
    <div
      className={cn("shine-border-06", className)}
      style={
        {
          "--focus-duration": `${duration}s`,
          "--focus-color": color,
        } as CSSProperties
      }
    >
      {corners.map((corner, index) => (
        <span
          key={corner}
          aria-hidden="true"
          className={`shine-border-06-corner shine-border-06-${corner}`}
          style={{ animationDelay: `${index * 0.3}s` }}
        />
      ))}
      <div className="shine-border-06-content">{children}</div>
    </div>
  );
}
