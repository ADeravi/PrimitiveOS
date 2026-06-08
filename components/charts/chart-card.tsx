"use client";
import * as React from "react";
import { Download } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCsv, exportPng, exportSvg } from "./export";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string;
  /** Rows offered as CSV download. Omit to hide the CSV entry. */
  exportData?: Record<string, unknown>[];
  /** Hide the export menu entirely. */
  noExport?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * The standard frame for every chart: Card + title/description, an export
 * menu (PNG / SVG / CSV) and smooth geometry transitions for child SVGs.
 * The body is exposed to assistive tech as a labelled figure.
 */
export function ChartCard({
  title,
  description,
  exportData,
  noExport,
  className,
  children,
}: ChartCardProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const grab = () => bodyRef.current?.querySelector("svg") ?? null;

  // Fade each chart in when it scrolls into view and out when it leaves, so a
  // page of charts reveals gently rather than popping. Falls back to "shown"
  // where IntersectionObserver is unavailable; reduced-motion users skip it.
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="chart-fade" data-shown={shown}>
    <Card className={cn("w-[620px] max-w-full", className)}>
      <style>{`
        .chart-fade {
          opacity: 0;
          transform: translateY(10px) scale(0.99);
          transition:
            opacity var(--duration-slow, 420ms) var(--ease-standard),
            transform var(--duration-slow, 420ms) var(--ease-standard);
          will-change: opacity, transform;
        }
        .chart-fade[data-shown="true"] { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .chart-fade { opacity: 1; transform: none; transition: none; }
        }
        .chart-card-body svg :is(rect, circle, line) {
          transition:
            x var(--duration-normal) var(--ease-standard),
            y var(--duration-normal) var(--ease-standard),
            width var(--duration-normal) var(--ease-standard),
            height var(--duration-normal) var(--ease-standard),
            cx var(--duration-normal) var(--ease-standard),
            cy var(--duration-normal) var(--ease-standard),
            r var(--duration-normal) var(--ease-standard),
            opacity var(--duration-fast) var(--ease-standard);
        }
        @media (prefers-reduced-motion: reduce) {
          .chart-card-body svg :is(rect, circle, line) { transition: none; }
        }
      `}</style>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {!noExport && (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Export chart">
                  <Download />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const svg = grab();
                    if (svg) exportPng(svg, `${slug}.png`);
                  }}
                >
                  Download PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const svg = grab();
                    if (svg) exportSvg(svg, `${slug}.svg`);
                  }}
                >
                  Download SVG
                </DropdownMenuItem>
                {exportData && exportData.length > 0 && (
                  <DropdownMenuItem onClick={() => exportCsv(exportData, `${slug}.csv`)}>
                    Download CSV
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={bodyRef}
          className="chart-card-body space-y-3"
          role="figure"
          aria-label={description ? `${title} chart. ${description}` : `${title} chart`}
        >
          {children}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

/** Horizontal wrapper for a chart's controls row. */
export function ChartControls({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">{children}</div>;
}
