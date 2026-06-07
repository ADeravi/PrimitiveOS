import * as React from "react"

import { cn } from "@/lib/utils"

const DOT: Record<string, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/40",
}

export function Timeline({ children, className }: React.ComponentProps<"ol">) {
  return <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>{children}</ol>
}

export function TimelineItem({
  title,
  time,
  status = "default",
  children,
  className,
}: {
  title: string
  time?: string
  status?: keyof typeof DOT
  children?: React.ReactNode
  className?: string
}) {
  return (
    <li className={cn("relative", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute -left-[31px] top-1 size-2.5 rounded-full ring-4 ring-background",
          DOT[status] ?? DOT.default
        )}
      />
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {time && <time className="text-xs text-muted-foreground">{time}</time>}
      </div>
      {children && <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>}
    </li>
  )
}
