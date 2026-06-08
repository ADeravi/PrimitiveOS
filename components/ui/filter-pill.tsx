"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** Swatch colour (any CSS colour — typically a --chart-* token). */
  color?: string;
  className?: string;
}

/**
 * A toggleable pill with an optional colour swatch — used as a clickable
 * legend entry or filter chip. Exposes state via aria-pressed.
 *
 * Contrast rules: the pill surface stays NEUTRAL (muted/foreground tokens)
 * so the colour swatch — typically a --chart-* tone that can be anything in
 * any Design Layer — always reads against it. The swatch also carries a
 * hairline border ring so it never dissolves into the pill, whatever the
 * layer or dark mode does to the palette.
 */
export function FilterPill({ label, active, onClick, color, className }: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-border bg-muted text-foreground shadow-xs"
          : "border-border bg-transparent text-muted-foreground opacity-60",
        className
      )}
    >
      {color && (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{
            background: color,
            opacity: active ? 1 : 0.4,
            boxShadow: "0 0 0 1px var(--border)",
          }}
        />
      )}
      {label}
    </button>
  );
}
