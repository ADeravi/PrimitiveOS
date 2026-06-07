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
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-border bg-transparent text-muted-foreground opacity-60",
        className
      )}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ background: color, opacity: active ? 1 : 0.4 }}
        />
      )}
      {label}
    </button>
  );
}
