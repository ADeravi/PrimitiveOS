"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepperStep = { id: string; title: string; description?: string }

export function Stepper({
  steps,
  current,
  onStepClick,
  className,
}: {
  steps: StepperStep[]
  current: number
  onStepClick?: (index: number) => void
  className?: string
}) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.id} className="flex flex-1 items-start gap-2 last:flex-none">
            <button
              type="button"
              disabled={!onStepClick}
              aria-current={active ? "step" : undefined}
              onClick={() => onStepClick?.(i)}
              className={cn("group flex flex-col items-center gap-1.5 text-center", onStepClick && "cursor-pointer")}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="w-24">
                <span
                  className={cn(
                    "block text-xs font-medium",
                    active || done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="block text-[11px] text-muted-foreground">{step.description}</span>
                )}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn("mt-4 h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
