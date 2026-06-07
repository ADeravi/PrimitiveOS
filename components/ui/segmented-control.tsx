"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Optional display labels keyed by option value. */
  labels?: Partial<Record<T, string>>;
  ariaLabel?: string;
  className?: string;
}

/**
 * A compact single-choice control — the lighter sibling of Tabs for
 * switching modes inside a card or toolbar. Active option uses --primary.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-md border border-border p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-[calc(var(--radius)-4px)] px-2.5 py-1 text-xs font-medium transition-colors",
            o === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {labels?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}
