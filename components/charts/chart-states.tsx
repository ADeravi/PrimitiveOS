"use client";
import * as React from "react";
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Standard non-data states for chart slots: loading skeleton, empty and
 * error. Same footprint as a rendered chart so layouts don't jump.
 */

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-64 w-full items-end gap-2 p-4", className)} aria-busy="true" aria-label="Chart loading">
      {[60, 90, 45, 75, 100, 55, 80, 35, 70, 50].map((h, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function ChartEmpty({
  title = "No data yet",
  description = "Data will appear here once events start flowing in.",
  actionLabel,
  onAction,
  className,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border", className)}>
      <BarChart3 className="size-8 text-muted-foreground/50" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-64 text-center text-xs text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button size="sm" variant="outline" className="mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ChartError({
  title = "Couldn't load this chart",
  description = "The data request failed. Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5", className)}
    >
      <AlertTriangle className="size-8 text-destructive/70" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-64 text-center text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-1" onClick={onRetry}>
          <RefreshCw /> Retry
        </Button>
      )}
    </div>
  );
}
