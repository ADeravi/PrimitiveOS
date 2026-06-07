"use client"

import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  readOnly,
  className,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  className?: string
}) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [hover, setHover] = React.useState(0)
  const current = value ?? internal
  const shown = hover || current

  const set = (n: number) => {
    if (readOnly) return
    setInternal(n)
    onValueChange?.(n)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={current === n}
            aria-label={`${n} of ${max}`}
            disabled={readOnly}
            className={cn(
              "rounded-sm p-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !readOnly && "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => !readOnly && setHover(n)}
            onClick={() => set(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") set(Math.min(max, current + 1))
              if (e.key === "ArrowLeft") set(Math.max(0, current - 1))
            }}
          >
            <Star
              className={cn(
                "size-5 transition-colors",
                n <= shown ? "fill-warning stroke-warning" : "fill-transparent stroke-muted-foreground/50"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
