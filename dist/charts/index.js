// components/charts/chart-card.tsx
import * as React from "react";
import { Download } from "lucide-react";

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// components/ui/card.tsx
import { jsx } from "react/jsx-runtime";
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
}
function CardAction({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-action",
      className: cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      ),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}

// components/ui/button.tsx
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { jsx as jsx2 } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx2(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

// components/ui/dropdown-menu.tsx
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx3(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx3(
    DropdownMenuPrimitive.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx3(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx3(
    DropdownMenuPrimitive.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx3(
    DropdownMenuPrimitive.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      ),
      ...props
    }
  );
}

// components/charts/export.ts
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
var STYLE_PROPS = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "opacity",
  "font-size",
  "font-family",
  "font-weight",
  "text-anchor"
];
function inlineSvg(svg) {
  const clone = svg.cloneNode(true);
  const src = svg.querySelectorAll("*");
  const dst = clone.querySelectorAll("*");
  src.forEach((el, i) => {
    const cs = getComputedStyle(el);
    for (const p of STYLE_PROPS) {
      const v = cs.getPropertyValue(p);
      if (v) dst[i].style.setProperty(p, v);
    }
  });
  const rect = svg.getBoundingClientRect();
  clone.setAttribute("width", String(Math.round(rect.width)));
  clone.setAttribute("height", String(Math.round(rect.height)));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", getComputedStyle(svg).getPropertyValue("background-color") || "white");
  const pageBg = getComputedStyle(document.body).backgroundColor;
  bg.setAttribute("fill", pageBg && pageBg !== "rgba(0, 0, 0, 0)" ? pageBg : "white");
  clone.insertBefore(bg, clone.firstChild);
  return clone;
}
function exportSvg(svg, filename = "chart.svg") {
  const xml = new XMLSerializer().serializeToString(inlineSvg(svg));
  download(new Blob([xml], { type: "image/svg+xml" }), filename);
}
function exportPng(svg, filename = "chart.png", scale = 2) {
  const xml = new XMLSerializer().serializeToString(inlineSvg(svg));
  const rect = svg.getBoundingClientRect();
  const img = new Image();
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    canvas.toBlob((blob) => {
      if (blob) download(blob, filename);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.src = url;
}
function exportCsv(rows, filename = "chart.csv") {
  if (!rows.length) return;
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v) => {
    const s = v === null || v === void 0 ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  download(new Blob([csv], { type: "text/csv" }), filename);
}

// components/charts/chart-card.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function ChartCard({
  title,
  description,
  exportData,
  noExport,
  className,
  children
}) {
  const bodyRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const grab = () => bodyRef.current?.querySelector("svg") ?? null;
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = wrapRef.current;
    const fallback = window.setTimeout(() => setShown(true), 500);
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return () => window.clearTimeout(fallback);
    }
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, []);
  return /* @__PURE__ */ jsx4("div", { ref: wrapRef, className: "chart-fade", "data-shown": shown, children: /* @__PURE__ */ jsxs2(Card, { className: cn("w-[620px] max-w-full", className), children: [
    /* @__PURE__ */ jsx4("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs2(CardHeader, { children: [
      /* @__PURE__ */ jsx4(CardTitle, { className: "text-base", children: title }),
      description && /* @__PURE__ */ jsx4(CardDescription, { children: description }),
      !noExport && /* @__PURE__ */ jsx4(CardAction, { children: /* @__PURE__ */ jsxs2(DropdownMenu, { children: [
        /* @__PURE__ */ jsx4(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx4(Button, { variant: "ghost", size: "sm", "aria-label": "Export chart", children: /* @__PURE__ */ jsx4(Download, {}) }) }),
        /* @__PURE__ */ jsxs2(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsx4(
            DropdownMenuItem,
            {
              onClick: () => {
                const svg = grab();
                if (svg) exportPng(svg, `${slug}.png`);
              },
              children: "Download PNG"
            }
          ),
          /* @__PURE__ */ jsx4(
            DropdownMenuItem,
            {
              onClick: () => {
                const svg = grab();
                if (svg) exportSvg(svg, `${slug}.svg`);
              },
              children: "Download SVG"
            }
          ),
          exportData && exportData.length > 0 && /* @__PURE__ */ jsx4(DropdownMenuItem, { onClick: () => exportCsv(exportData, `${slug}.csv`), children: "Download CSV" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx4(CardContent, { className: "space-y-3", children: /* @__PURE__ */ jsx4(
      "div",
      {
        ref: bodyRef,
        className: "chart-card-body space-y-3",
        role: "figure",
        "aria-label": description ? `${title} chart. ${description}` : `${title} chart`,
        children
      }
    ) })
  ] }) });
}
function ChartControls({ children }) {
  return /* @__PURE__ */ jsx4("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2 pb-1", children });
}

// components/charts/chart-states.tsx
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";

// components/ui/skeleton.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx5(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("animate-pulse rounded-md bg-accent", className),
      ...props
    }
  );
}

// components/charts/chart-states.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function ChartSkeleton({ className }) {
  return /* @__PURE__ */ jsx6("div", { className: cn("flex h-64 w-full items-end gap-2 p-4", className), "aria-busy": "true", "aria-label": "Chart loading", children: [60, 90, 45, 75, 100, 55, 80, 35, 70, 50].map((h, i) => /* @__PURE__ */ jsx6(Skeleton, { className: "flex-1", style: { height: `${h}%` } }, i)) });
}
function ChartEmpty({
  title = "No data yet",
  description = "Data will appear here once events start flowing in.",
  actionLabel,
  onAction,
  className
}) {
  return /* @__PURE__ */ jsxs3("div", { className: cn("flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border", className), children: [
    /* @__PURE__ */ jsx6(BarChart3, { className: "size-8 text-muted-foreground/50", "aria-hidden": true }),
    /* @__PURE__ */ jsx6("p", { className: "text-sm font-medium text-foreground", children: title }),
    /* @__PURE__ */ jsx6("p", { className: "max-w-64 text-center text-xs text-muted-foreground", children: description }),
    actionLabel && /* @__PURE__ */ jsx6(Button, { size: "sm", variant: "outline", className: "mt-1", onClick: onAction, children: actionLabel })
  ] });
}
function ChartError({
  title = "Couldn't load this chart",
  description = "The data request failed. Check your connection and try again.",
  onRetry,
  className
}) {
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      role: "alert",
      className: cn("flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5", className),
      children: [
        /* @__PURE__ */ jsx6(AlertTriangle, { className: "size-8 text-destructive/70", "aria-hidden": true }),
        /* @__PURE__ */ jsx6("p", { className: "text-sm font-medium text-foreground", children: title }),
        /* @__PURE__ */ jsx6("p", { className: "max-w-64 text-center text-xs text-muted-foreground", children: description }),
        onRetry && /* @__PURE__ */ jsxs3(Button, { size: "sm", variant: "outline", className: "mt-1", onClick: onRetry, children: [
          /* @__PURE__ */ jsx6(RefreshCw, {}),
          " Retry"
        ] })
      ]
    }
  );
}

// components/charts/core.tsx
import * as React4 from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";

// components/ui/chart.tsx
import * as React2 from "react";
import * as RechartsPrimitive from "recharts";
import { Fragment, jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var THEMES = { light: "", dark: ".dark" };
var INITIAL_DIMENSION = { width: 320, height: 200 };
var ChartContext = React2.createContext(null);
function useChart() {
  const context = React2.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}) {
  const uniqueId = React2.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsx7(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxs4(
    "div",
    {
      "data-slot": "chart",
      "data-chart": chartId,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx7(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsx7(
          RechartsPrimitive.ResponsiveContainer,
          {
            initialDimension,
            children
          }
        )
      ]
    }
  ) });
}
var ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme ?? config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsx7(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] ?? itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
var ChartTooltip = RechartsPrimitive.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart();
  const tooltipLabel = React2.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label ?? label : itemConfig?.label;
    if (labelFormatter) {
      return /* @__PURE__ */ jsx7("div", { className: cn("font-medium break-words", labelClassName), children: labelFormatter(value, payload) });
    }
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ jsx7("div", { className: cn("font-medium break-words", labelClassName), children: value });
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey
  ]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: cn(
        "grid min-w-[8rem] max-w-[18rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      ),
      children: [
        !nestLabel ? tooltipLabel : null,
        /* @__PURE__ */ jsx7("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload?.fill ?? item.color;
          return /* @__PURE__ */ jsx7(
            "div",
            {
              className: cn(
                "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              ),
              children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxs4(Fragment, { children: [
                itemConfig?.icon ? /* @__PURE__ */ jsx7(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsx7(
                  "div",
                  {
                    className: cn(
                      "mt-0.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed"
                      }
                    ),
                    style: {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                  }
                ),
                /* @__PURE__ */ jsxs4(
                  "div",
                  {
                    className: cn(
                      "flex flex-1 items-start justify-between gap-3 leading-snug",
                      nestLabel ? "items-end" : "items-start"
                    ),
                    children: [
                      /* @__PURE__ */ jsxs4("div", { className: "grid min-w-0 gap-1.5", children: [
                        nestLabel ? tooltipLabel : null,
                        /* @__PURE__ */ jsx7("span", { className: "break-words text-muted-foreground", children: itemConfig?.label ?? item.name })
                      ] }),
                      item.value != null && /* @__PURE__ */ jsx7("span", { className: "shrink-0 whitespace-nowrap font-mono font-medium text-foreground tabular-nums", children: typeof item.value === "number" ? item.value.toLocaleString() : String(item.value) })
                    ]
                  }
                )
              ] })
            },
            index
          );
        }) })
      ]
    }
  );
}
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}

// components/ui/label.tsx
import { Label as LabelPrimitive } from "radix-ui";
import { jsx as jsx8 } from "react/jsx-runtime";
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx8(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}

// components/ui/slider.tsx
import * as React3 from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React3.useMemo(
    () => Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
    [value, defaultValue, min, max]
  );
  return /* @__PURE__ */ jsxs5(
    SliderPrimitive.Root,
    {
      "data-slot": "slider",
      defaultValue,
      value,
      min,
      max,
      className: cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx9(
          SliderPrimitive.Track,
          {
            "data-slot": "slider-track",
            className: cn(
              "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ jsx9(
              SliderPrimitive.Range,
              {
                "data-slot": "slider-range",
                className: cn(
                  "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: _values.length }, (_, index) => /* @__PURE__ */ jsx9(
          SliderPrimitive.Thumb,
          {
            "data-slot": "slider-thumb",
            className: "block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          },
          index
        ))
      ]
    }
  );
}

// components/ui/switch.tsx
import { Switch as SwitchPrimitive } from "radix-ui";
import { jsx as jsx10 } from "react/jsx-runtime";
function Switch({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx10(
    SwitchPrimitive.Root,
    {
      "data-slot": "switch",
      "data-size": size,
      className: cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx10(
        SwitchPrimitive.Thumb,
        {
          "data-slot": "switch-thumb",
          className: cn(
            "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
          )
        }
      )
    }
  );
}

// components/ui/segmented-control.tsx
import { jsx as jsx11 } from "react/jsx-runtime";
function SegmentedControl({
  options,
  value,
  onChange,
  labels,
  ariaLabel,
  className
}) {
  return /* @__PURE__ */ jsx11(
    "div",
    {
      role: "group",
      "aria-label": ariaLabel,
      className: cn("inline-flex rounded-md border border-border p-0.5", className),
      children: options.map((o) => /* @__PURE__ */ jsx11(
        "button",
        {
          type: "button",
          "aria-pressed": o === value,
          onClick: () => onChange(o),
          className: cn(
            "rounded-[calc(var(--radius)-4px)] px-2.5 py-1 text-xs font-medium transition-colors",
            o === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          ),
          children: labels?.[o] ?? o
        },
        o
      ))
    }
  );
}

// components/ui/filter-pill.tsx
import { jsx as jsx12, jsxs as jsxs6 } from "react/jsx-runtime";
function FilterPill({ label, active, onClick, color, className }) {
  return /* @__PURE__ */ jsxs6(
    "button",
    {
      type: "button",
      "aria-pressed": active,
      onClick,
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "border-border bg-muted text-foreground shadow-xs" : "border-border bg-transparent text-muted-foreground opacity-60",
        className
      ),
      children: [
        color && /* @__PURE__ */ jsx12(
          "span",
          {
            className: "size-2 shrink-0 rounded-full",
            style: {
              background: color,
              opacity: active ? 1 : 0.4,
              boxShadow: "0 0 0 1px var(--border)"
            }
          }
        ),
        label
      ]
    }
  );
}

// components/charts/core.tsx
import { Fragment as Fragment2, jsx as jsx13, jsxs as jsxs7 } from "react/jsx-runtime";
var TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MONTHS24 = Array.from({ length: 24 }, (_, i) => ({
  month: `${MONTH_NAMES[i % 12]} ${i < 12 ? "25" : "26"}`,
  desktop: Math.round(180 + 70 * Math.sin(i / 2.4) + i * 4),
  mobile: Math.round(120 + 50 * Math.sin(i / 1.9 + 1.2) + i * 6),
  tablet: Math.round(60 + 28 * Math.sin(i / 3.1 + 2.4) + i * 1.5)
}));
var SERIES = [
  { key: "desktop", label: "Desktop", color: TOKEN[0] },
  { key: "mobile", label: "Mobile", color: TOKEN[1] },
  { key: "tablet", label: "Tablet", color: TOKEN[2] }
];
var seriesConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" }
};
function useSeriesToggle() {
  const [on, setOn] = React4.useState({ desktop: true, mobile: true, tablet: true });
  const toggle = (k) => setOn((s) => ({ ...s, [k]: !s[k] }));
  return { on, toggle };
}
var RANGES = ["6M", "12M", "24M"];
function ChartLine({
  data = MONTHS24,
  title = "Line",
  description = "Range, curve interpolation, point markers and per-series visibility."
}) {
  const { on, toggle } = useSeriesToggle();
  const [range, setRange] = React4.useState("12M");
  const [curve, setCurve] = React4.useState("smooth");
  const [dots, setDots] = React4.useState(false);
  const type = curve === "smooth" ? "monotone" : curve === "linear" ? "linear" : "stepAfter";
  const sliced = data.slice(range === "6M" ? -6 : range === "12M" ? -12 : 0);
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: sliced, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13(SegmentedControl, { options: RANGES, value: range, onChange: setRange, ariaLabel: "Range" }),
      /* @__PURE__ */ jsx13(SegmentedControl, { options: ["smooth", "linear", "step"], value: curve, onChange: setCurve, ariaLabel: "Curve" }),
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx13(Switch, { id: "line-dots", checked: dots, onCheckedChange: setDots }),
        /* @__PURE__ */ jsx13(Label, { htmlFor: "line-dots", className: "text-xs text-muted-foreground", children: "Dots" })
      ] }),
      /* @__PURE__ */ jsx13("span", { className: "flex items-center gap-1.5", children: SERIES.map((s) => /* @__PURE__ */ jsx13(FilterPill, { label: s.label, color: s.color, active: on[s.key], onClick: () => toggle(s.key) }, s.key)) })
    ] }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: seriesConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs7(LineChart, { data: sliced, margin: { left: 0, right: 12 }, children: [
      /* @__PURE__ */ jsx13(CartesianGrid, { vertical: false }),
      /* @__PURE__ */ jsx13(XAxis, { dataKey: "month", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 28 }),
      /* @__PURE__ */ jsx13(YAxis, { tickLine: false, axisLine: false, width: 36 }),
      /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, {}) }),
      SERIES.filter((s) => on[s.key]).map((s) => /* @__PURE__ */ jsx13(Line, { dataKey: s.key, type, stroke: s.color, strokeWidth: 2, dot: dots }, s.key))
    ] }) })
  ] });
}
function ChartArea({
  data = MONTHS24,
  title = "Area",
  description = "Stacked, overlapped or 100% normalised; toggle series in and out."
}) {
  const { on, toggle } = useSeriesToggle();
  const [range, setRange] = React4.useState("12M");
  const [mode, setMode] = React4.useState("stacked");
  const stackId = mode === "overlap" ? void 0 : "a";
  const sliced = data.slice(range === "6M" ? -6 : range === "12M" ? -12 : 0);
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: sliced, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13(SegmentedControl, { options: RANGES, value: range, onChange: setRange, ariaLabel: "Range" }),
      /* @__PURE__ */ jsx13(SegmentedControl, { options: ["stacked", "overlap", "100%"], value: mode, onChange: setMode, ariaLabel: "Mode" }),
      /* @__PURE__ */ jsx13("span", { className: "flex items-center gap-1.5", children: SERIES.map((s) => /* @__PURE__ */ jsx13(FilterPill, { label: s.label, color: s.color, active: on[s.key], onClick: () => toggle(s.key) }, s.key)) })
    ] }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: seriesConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs7(AreaChart, { data: sliced, stackOffset: mode === "100%" ? "expand" : "none", margin: { left: 0, right: 12 }, children: [
      /* @__PURE__ */ jsx13(CartesianGrid, { vertical: false }),
      /* @__PURE__ */ jsx13(XAxis, { dataKey: "month", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 28 }),
      /* @__PURE__ */ jsx13(
        YAxis,
        {
          tickLine: false,
          axisLine: false,
          width: 40,
          tickFormatter: (v) => mode === "100%" ? `${Math.round(v * 100)}%` : `${v}`
        }
      ),
      /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, {}) }),
      SERIES.filter((s) => on[s.key]).map((s) => /* @__PURE__ */ jsx13(
        Area,
        {
          dataKey: s.key,
          type: "monotone",
          stackId,
          stroke: s.color,
          fill: s.color,
          fillOpacity: mode === "overlap" ? 0.25 : 0.4
        },
        s.key
      ))
    ] }) })
  ] });
}
var REGION_DATA = [
  { region: "AMER", current: 420, previous: 360 },
  { region: "EMEA", current: 360, previous: 390 },
  { region: "APAC", current: 290, previous: 215 },
  { region: "LATAM", current: 140, previous: 110 },
  { region: "MEA", current: 90, previous: 95 }
];
var regionConfig = {
  current: { label: "FY26", color: "var(--chart-1)" },
  previous: { label: "FY25", color: "var(--chart-3)" }
};
function ChartBar({
  data = REGION_DATA,
  title = "Bar",
  description = "Grouped vs stacked, sorted vs source order, vertical vs horizontal."
}) {
  const [mode, setMode] = React4.useState("grouped");
  const [sorted, setSorted] = React4.useState(false);
  const [horizontal, setHorizontal] = React4.useState(false);
  const rows = sorted ? [...data].sort((a, b) => b.current - a.current) : data;
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: rows, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13(SegmentedControl, { options: ["grouped", "stacked"], value: mode, onChange: setMode, ariaLabel: "Mode" }),
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx13(Switch, { id: "bar-sort", checked: sorted, onCheckedChange: setSorted }),
        /* @__PURE__ */ jsx13(Label, { htmlFor: "bar-sort", className: "text-xs text-muted-foreground", children: "Sort by value" })
      ] }),
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx13(Switch, { id: "bar-horiz", checked: horizontal, onCheckedChange: setHorizontal }),
        /* @__PURE__ */ jsx13(Label, { htmlFor: "bar-horiz", className: "text-xs text-muted-foreground", children: "Horizontal" })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: regionConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs7(BarChart, { data: rows, layout: horizontal ? "vertical" : "horizontal", margin: { left: 0, right: 12 }, children: [
      /* @__PURE__ */ jsx13(CartesianGrid, { vertical: horizontal, horizontal: !horizontal }),
      horizontal ? /* @__PURE__ */ jsxs7(Fragment2, { children: [
        /* @__PURE__ */ jsx13(YAxis, { dataKey: "region", type: "category", tickLine: false, axisLine: false, width: 56 }),
        /* @__PURE__ */ jsx13(XAxis, { type: "number", tickLine: false, axisLine: false })
      ] }) : /* @__PURE__ */ jsxs7(Fragment2, { children: [
        /* @__PURE__ */ jsx13(XAxis, { dataKey: "region", tickLine: false, axisLine: false, tickMargin: 8 }),
        /* @__PURE__ */ jsx13(YAxis, { tickLine: false, axisLine: false, width: 36 })
      ] }),
      /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, {}) }),
      /* @__PURE__ */ jsx13(Bar, { dataKey: "previous", stackId: mode === "stacked" ? "s" : void 0, fill: "var(--chart-3)", radius: 3 }),
      /* @__PURE__ */ jsx13(Bar, { dataKey: "current", stackId: mode === "stacked" ? "s" : void 0, fill: "var(--chart-1)", radius: 3 })
    ] }) })
  ] });
}
var DONUT_PARTS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 }
];
function ChartDonut({
  data = DONUT_PARTS,
  title = "Donut",
  description = "Toggle slices and adjust the inner radius from ring to pie.",
  unit = "visitors"
}) {
  const [on, setOn] = React4.useState(
    Object.fromEntries(data.map((p) => [p.key, true]))
  );
  const [inner, setInner] = React4.useState(55);
  const config = Object.fromEntries(
    data.map((p, i) => [p.key, { label: p.label, color: `var(--chart-${i % 5 + 1})` }])
  );
  const visible = data.filter((p) => on[p.key]).map((p) => ({ ...p, fill: TOKEN[data.indexOf(p) % 5] }));
  const total = visible.reduce((a, p) => a + p.value, 0);
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: visible, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13("span", { className: "flex items-center gap-1.5", children: data.map((p, i) => /* @__PURE__ */ jsx13(
        FilterPill,
        {
          label: p.label,
          color: TOKEN[i % 5],
          active: on[p.key],
          onClick: () => setOn((s) => ({ ...s, [p.key]: !s[p.key] }))
        },
        p.key
      )) }),
      /* @__PURE__ */ jsxs7("span", { className: "flex w-44 items-center gap-2", children: [
        /* @__PURE__ */ jsxs7(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Inner ",
          inner
        ] }),
        /* @__PURE__ */ jsx13(Slider, { value: [inner], onValueChange: ([v]) => setInner(v), min: 0, max: 80, step: 5 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "relative", children: [
      /* @__PURE__ */ jsx13(ChartContainer, { config, className: "mx-auto aspect-square max-h-64", children: /* @__PURE__ */ jsxs7(PieChart, { children: [
        /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, { hideLabel: true }) }),
        /* @__PURE__ */ jsx13(Pie, { data: visible, dataKey: "value", nameKey: "label", innerRadius: inner, strokeWidth: 2 })
      ] }) }),
      inner >= 35 && /* @__PURE__ */ jsxs7("div", { className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsx13("span", { className: "text-2xl font-bold tabular-nums text-foreground", children: total }),
        /* @__PURE__ */ jsx13("span", { className: "text-xs text-muted-foreground", children: unit })
      ] })
    ] })
  ] });
}
var RADAR_DATA = [
  { metric: "Speed", a: 80, b: 60, c: 45 },
  { metric: "Quality", a: 70, b: 85, c: 60 },
  { metric: "Cost", a: 60, b: 70, c: 90 },
  { metric: "Scale", a: 90, b: 55, c: 50 },
  { metric: "Support", a: 65, b: 80, c: 70 },
  { metric: "Docs", a: 55, b: 62, c: 78 }
];
var PLANS = [
  { key: "a", label: "Plan A", color: TOKEN[0] },
  { key: "b", label: "Plan B", color: TOKEN[2] },
  { key: "c", label: "Plan C", color: TOKEN[1] }
];
var radarConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" },
  c: { label: "Plan C", color: "var(--chart-2)" }
};
function ChartRadar({
  title = "Radar",
  description = "Compare up to three plans; tune the fill opacity for overlap legibility."
}) {
  const [on, setOn] = React4.useState({ a: true, b: true, c: false });
  const [opacity, setOpacity] = React4.useState(45);
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: RADAR_DATA, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13("span", { className: "flex items-center gap-1.5", children: PLANS.map((p) => /* @__PURE__ */ jsx13(
        FilterPill,
        {
          label: p.label,
          color: p.color,
          active: on[p.key],
          onClick: () => setOn((s) => ({ ...s, [p.key]: !s[p.key] }))
        },
        p.key
      )) }),
      /* @__PURE__ */ jsxs7("span", { className: "flex w-44 items-center gap-2", children: [
        /* @__PURE__ */ jsxs7(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Fill ",
          opacity,
          "%"
        ] }),
        /* @__PURE__ */ jsx13(Slider, { value: [opacity], onValueChange: ([v]) => setOpacity(v), min: 0, max: 80, step: 5 })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: radarConfig, className: "mx-auto aspect-square max-h-64", children: /* @__PURE__ */ jsxs7(RadarChart, { data: RADAR_DATA, children: [
      /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, {}) }),
      /* @__PURE__ */ jsx13(PolarAngleAxis, { dataKey: "metric" }),
      /* @__PURE__ */ jsx13(PolarGrid, {}),
      PLANS.filter((p) => on[p.key]).map((p) => /* @__PURE__ */ jsx13(Radar, { dataKey: p.key, stroke: p.color, fill: p.color, fillOpacity: opacity / 100 }, p.key))
    ] }) })
  ] });
}
var SCATTER = [0, 1].map(
  (g) => Array.from({ length: 14 }, (_, i) => {
    const r = (k) => {
      const x = Math.sin((i + 1) * 127.1 + (g + 1) * 311.7 + k * 73.3) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      x: Math.round(10 + r(1) * 55 + g * 6),
      y: Math.round(8 + r(2) * 48 + g * 10),
      z: Math.round(30 + r(3) * 170)
    };
  })
);
var scatterConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" }
};
function ChartScatter({
  title = "Scatter / Bubble",
  description = "Toggle series, switch bubble sizing on or off, scale the size range."
}) {
  const [on, setOn] = React4.useState({ a: true, b: true });
  const [bubble, setBubble] = React4.useState(true);
  const [size, setSize] = React4.useState(160);
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: [...SCATTER[0], ...SCATTER[1]], children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx13(FilterPill, { label: "Plan A", color: TOKEN[0], active: on.a, onClick: () => setOn((s) => ({ ...s, a: !s.a })) }),
        /* @__PURE__ */ jsx13(FilterPill, { label: "Plan B", color: TOKEN[2], active: on.b, onClick: () => setOn((s) => ({ ...s, b: !s.b })) })
      ] }),
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx13(Switch, { id: "sc-bubble", checked: bubble, onCheckedChange: setBubble }),
        /* @__PURE__ */ jsx13(Label, { htmlFor: "sc-bubble", className: "text-xs text-muted-foreground", children: "Bubble size" })
      ] }),
      /* @__PURE__ */ jsxs7("span", { className: "flex w-44 items-center gap-2", children: [
        /* @__PURE__ */ jsxs7(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Max ",
          size
        ] }),
        /* @__PURE__ */ jsx13(Slider, { value: [size], onValueChange: ([v]) => setSize(v), min: 60, max: 400, step: 20, disabled: !bubble })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: scatterConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs7(ScatterChart, { margin: { left: 0, right: 12 }, children: [
      /* @__PURE__ */ jsx13(CartesianGrid, {}),
      /* @__PURE__ */ jsx13(XAxis, { type: "number", dataKey: "x", name: "Sessions (k)", tickLine: false, axisLine: false, tickMargin: 8 }),
      /* @__PURE__ */ jsx13(YAxis, { type: "number", dataKey: "y", name: "Revenue ($k)", tickLine: false, axisLine: false, width: 32 }),
      /* @__PURE__ */ jsx13(ZAxis, { type: "number", dataKey: "z", range: bubble ? [40, size] : [70, 70], name: "Accounts" }),
      /* @__PURE__ */ jsx13(ChartTooltip, { cursor: { strokeDasharray: "3 3" }, content: /* @__PURE__ */ jsx13(ChartTooltipContent, { hideLabel: true }) }),
      on.a && /* @__PURE__ */ jsx13(Scatter, { name: "a", data: SCATTER[0], fill: TOKEN[0], fillOpacity: 0.75 }),
      on.b && /* @__PURE__ */ jsx13(Scatter, { name: "b", data: SCATTER[1], fill: TOKEN[2], fillOpacity: 0.75 })
    ] }) })
  ] });
}
var HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var heat = (d, w) => (Math.sin(d * 3.7 + w * 1.3) + Math.cos(d * 1.9 - w * 2.3) + 2) / 4;
function ChartHeatmap({
  title = "Heatmap",
  description = "Adjust the visible window and filter low-intensity cells with the threshold."
}) {
  const [weeks, setWeeks] = React4.useState("14");
  const [threshold, setThreshold] = React4.useState(0);
  const [hover, setHover] = React4.useState(null);
  const W = Number(weeks);
  const cell = 16;
  const pad = 30;
  const csv = HEAT_DAYS.flatMap(
    (day, d) => Array.from({ length: W }, (_, w) => ({ day, week: w + 1, value: Math.round(heat(d, w) * 100) }))
  );
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: csv, children: [
    /* @__PURE__ */ jsxs7(ChartControls, { children: [
      /* @__PURE__ */ jsx13(SegmentedControl, { options: ["8", "14", "20"], value: weeks, onChange: setWeeks, ariaLabel: "Weeks" }),
      /* @__PURE__ */ jsxs7("span", { className: "flex w-52 items-center gap-2", children: [
        /* @__PURE__ */ jsxs7(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Min ",
          threshold,
          "%"
        ] }),
        /* @__PURE__ */ jsx13(Slider, { value: [threshold], onValueChange: ([v]) => setThreshold(v), min: 0, max: 80, step: 5 })
      ] }),
      /* @__PURE__ */ jsx13("span", { className: "text-xs tabular-nums text-muted-foreground min-w-28", children: hover ?? "hover a cell" })
    ] }),
    /* @__PURE__ */ jsxs7("svg", { viewBox: `0 0 ${pad + W * cell + 4} ${18 + 7 * cell + 4}`, className: "w-full", children: [
      HEAT_DAYS.map((d, i) => /* @__PURE__ */ jsx13("text", { x: pad - 5, y: 18 + i * cell + cell * 0.7, textAnchor: "end", fontSize: 7, fontFamily: "monospace", fill: "var(--muted-foreground)", children: d }, d)),
      HEAT_DAYS.map(
        (_, d) => Array.from({ length: W }, (_2, w) => {
          const v = heat(d, w);
          const below = v * 100 < threshold;
          return /* @__PURE__ */ jsx13(
            "rect",
            {
              x: pad + w * cell,
              y: 18 + d * cell,
              width: cell - 2,
              height: cell - 2,
              rx: 3,
              fill: below ? "var(--muted)" : "var(--chart-1)",
              opacity: below ? 0.5 : 0.25 + v * 0.75,
              onMouseEnter: () => setHover(`${HEAT_DAYS[d]} W${w + 1}: ${Math.round(v * 100)}%`),
              onMouseLeave: () => setHover(null),
              children: /* @__PURE__ */ jsx13("title", { children: `${HEAT_DAYS[d]} W${w + 1}: ${Math.round(v * 100)}%` })
            },
            `${d}-${w}`
          );
        })
      )
    ] })
  ] });
}
var COMBO = Array.from({ length: 12 }, (_, i) => ({
  month: MONTH_NAMES[i],
  revenue: Math.round(40 + 18 * Math.sin(i / 1.9) + i * 2.4),
  users: Math.round(300 + 90 * Math.sin(i / 2.4 + 1) + i * 18),
  conversion: Math.round((2 + 0.8 * Math.sin(i / 1.6 + 2) + i * 0.09) * 10) / 10
}));
var comboConfig = {
  revenue: { label: "Revenue ($k)", color: "var(--chart-1)" },
  users: { label: "Active users", color: "var(--chart-2)" },
  conversion: { label: "Conversion (%)", color: "var(--chart-3)" }
};
function ChartDualAxis({
  title = "Dual axis",
  description = "Revenue as bars on the left scale; users and conversion as lines on the right."
}) {
  const [on, setOn] = React4.useState({ revenue: true, users: false, conversion: true });
  return /* @__PURE__ */ jsxs7(ChartCard, { title, description, exportData: COMBO, children: [
    /* @__PURE__ */ jsx13(ChartControls, { children: /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx13(FilterPill, { label: "Revenue", color: TOKEN[0], active: on.revenue, onClick: () => setOn((s) => ({ ...s, revenue: !s.revenue })) }),
      /* @__PURE__ */ jsx13(FilterPill, { label: "Users", color: TOKEN[1], active: on.users, onClick: () => setOn((s) => ({ ...s, users: !s.users })) }),
      /* @__PURE__ */ jsx13(FilterPill, { label: "Conversion", color: TOKEN[2], active: on.conversion, onClick: () => setOn((s) => ({ ...s, conversion: !s.conversion })) })
    ] }) }),
    /* @__PURE__ */ jsx13(ChartContainer, { config: comboConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs7(ComposedChart, { data: COMBO, margin: { left: 0, right: 0 }, children: [
      /* @__PURE__ */ jsx13(CartesianGrid, { vertical: false }),
      /* @__PURE__ */ jsx13(XAxis, { dataKey: "month", tickLine: false, axisLine: false, tickMargin: 8 }),
      /* @__PURE__ */ jsx13(YAxis, { yAxisId: "left", tickLine: false, axisLine: false, width: 32 }),
      /* @__PURE__ */ jsx13(YAxis, { yAxisId: "right", orientation: "right", tickLine: false, axisLine: false, width: 38 }),
      /* @__PURE__ */ jsx13(ChartTooltip, { content: /* @__PURE__ */ jsx13(ChartTooltipContent, {}) }),
      on.revenue && /* @__PURE__ */ jsx13(Bar, { yAxisId: "left", dataKey: "revenue", fill: "var(--chart-1)", radius: 4 }),
      on.users && /* @__PURE__ */ jsx13(Line, { yAxisId: "right", dataKey: "users", type: "monotone", stroke: "var(--chart-2)", strokeWidth: 2, dot: false }),
      on.conversion && /* @__PURE__ */ jsx13(Line, { yAxisId: "right", dataKey: "conversion", type: "monotone", stroke: "var(--chart-3)", strokeWidth: 2, strokeDasharray: "4 3", dot: false })
    ] }) })
  ] });
}

// components/charts/flow.tsx
import * as React5 from "react";
import {
  Bar as Bar2,
  BarChart as BarChart2,
  CartesianGrid as CartesianGrid2,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Sankey,
  Treemap,
  XAxis as XAxis2
} from "recharts";
import { hierarchy, partition } from "d3-hierarchy";
import {
  arc,
  area,
  curveBasis,
  stack,
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetSilhouette,
  stackOffsetWiggle,
  stackOrderInsideOut
} from "d3-shape";
import { jsx as jsx14, jsxs as jsxs8 } from "react/jsx-runtime";
var TOKEN2 = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
var TREE_PARTS = [
  { name: "Platform", size: 34 },
  { name: "Mobile", size: 22 },
  { name: "Integrations", size: 16 },
  { name: "Docs", size: 12 },
  { name: "CLI", size: 9 },
  { name: "SDKs", size: 4 },
  { name: "Misc", size: 3 }
];
function TreemapCell(props) {
  const { x = 0, y = 0, width = 0, height = 0, name, fill, depth } = props;
  if (!depth) return null;
  return /* @__PURE__ */ jsxs8("g", { children: [
    /* @__PURE__ */ jsx14("rect", { x, y, width, height, rx: 4, fill: fill ?? TOKEN2[0], stroke: "var(--background)", strokeWidth: 2 }),
    width > 52 && height > 26 && /* @__PURE__ */ jsx14("text", { x: x + 8, y: y + 18, fontSize: 11, fontWeight: 600, fill: "var(--background)", children: name })
  ] });
}
function ChartTreemap({
  data = TREE_PARTS,
  title = "Treemap",
  description = "Slide the threshold to merge small tiles into an honest 'Other'."
}) {
  const [minShare, setMinShare] = React5.useState(0);
  const total = data.reduce((a, p) => a + p.size, 0);
  const keep = data.filter((p) => p.size / total * 100 >= minShare);
  const merged = data.filter((p) => p.size / total * 100 < minShare);
  const rows = [
    ...keep.map((p, i) => ({ ...p, fill: TOKEN2[i % 5] })),
    ...merged.length ? [{ name: "Other", size: merged.reduce((a, p) => a + p.size, 0), fill: "var(--muted-foreground)" }] : []
  ];
  return /* @__PURE__ */ jsxs8(ChartCard, { title, description, exportData: rows.map(({ name, size }) => ({ name, size })), children: [
    /* @__PURE__ */ jsxs8(ChartControls, { children: [
      /* @__PURE__ */ jsxs8("span", { className: "flex w-56 items-center gap-2", children: [
        /* @__PURE__ */ jsxs8(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Min share ",
          minShare,
          "%"
        ] }),
        /* @__PURE__ */ jsx14(Slider, { value: [minShare], onValueChange: ([v]) => setMinShare(v), min: 0, max: 15, step: 1 })
      ] }),
      /* @__PURE__ */ jsxs8("span", { className: "text-xs text-muted-foreground", children: [
        rows.length,
        " tiles"
      ] })
    ] }),
    /* @__PURE__ */ jsx14(ChartContainer, { config: {}, className: "h-64 w-full", children: /* @__PURE__ */ jsx14(Treemap, { data: rows, dataKey: "size", content: /* @__PURE__ */ jsx14(TreemapCell, {}) }) })
  ] });
}
var SANKEY_DATA = {
  nodes: [
    { name: "Visits" },
    { name: "Signups" },
    { name: "Bounced" },
    { name: "Free" },
    { name: "Pro" },
    { name: "Retained" },
    { name: "Churned" }
  ],
  links: [
    { source: 0, target: 1, value: 60 },
    { source: 0, target: 2, value: 40 },
    { source: 1, target: 3, value: 42 },
    { source: 1, target: 4, value: 18 },
    { source: 3, target: 5, value: 30 },
    { source: 3, target: 6, value: 12 },
    { source: 4, target: 5, value: 15 },
    { source: 4, target: 6, value: 3 }
  ]
};
function ChartSankey({
  title = "Sankey",
  description = "Tune node padding and link opacity to balance flow legibility."
}) {
  const [padding, setPadding] = React5.useState(28);
  const [opacity, setOpacity] = React5.useState(35);
  const csv = SANKEY_DATA.links.map((l) => ({
    source: SANKEY_DATA.nodes[l.source].name,
    target: SANKEY_DATA.nodes[l.target].name,
    value: l.value
  }));
  return /* @__PURE__ */ jsxs8(ChartCard, { title, description, exportData: csv, children: [
    /* @__PURE__ */ jsxs8(ChartControls, { children: [
      /* @__PURE__ */ jsxs8("span", { className: "flex w-48 items-center gap-2", children: [
        /* @__PURE__ */ jsxs8(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Padding ",
          padding
        ] }),
        /* @__PURE__ */ jsx14(Slider, { value: [padding], onValueChange: ([v]) => setPadding(v), min: 8, max: 56, step: 4 })
      ] }),
      /* @__PURE__ */ jsxs8("span", { className: "flex w-48 items-center gap-2", children: [
        /* @__PURE__ */ jsxs8(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Links ",
          opacity,
          "%"
        ] }),
        /* @__PURE__ */ jsx14(Slider, { value: [opacity], onValueChange: ([v]) => setOpacity(v), min: 10, max: 80, step: 5 })
      ] })
    ] }),
    /* @__PURE__ */ jsx14(ChartContainer, { config: {}, className: "h-64 w-full", children: /* @__PURE__ */ jsx14(
      Sankey,
      {
        data: SANKEY_DATA,
        nodePadding: padding,
        margin: { top: 8, right: 70, bottom: 8, left: 8 },
        node: { fill: "var(--chart-1)", stroke: "none" },
        link: { stroke: "var(--chart-2)", strokeOpacity: opacity / 100 }
      }
    ) })
  ] });
}
var FUNNEL_ALL = [
  { name: "Visited", value: 1e3 },
  { name: "Signed up", value: 620 },
  { name: "Activated", value: 410 },
  { name: "Subscribed", value: 190 },
  { name: "Renewed", value: 120 }
];
function ChartFunnel({
  data = FUNNEL_ALL,
  title = "Funnel",
  description = "Choose the number of stages and switch between names and conversion rates."
}) {
  const [stages, setStages] = React5.useState("5");
  const [percent, setPercent] = React5.useState(true);
  const rows = data.slice(0, Number(stages)).map((d, i) => ({
    ...d,
    fill: TOKEN2[i % 5],
    label: percent ? `${d.name} \xB7 ${Math.round(d.value / data[0].value * 100)}%` : d.name
  }));
  return /* @__PURE__ */ jsxs8(ChartCard, { title, description, exportData: rows.map(({ name, value }) => ({ name, value })), children: [
    /* @__PURE__ */ jsxs8(ChartControls, { children: [
      /* @__PURE__ */ jsx14(SegmentedControl, { options: ["3", "4", "5"], value: stages, onChange: setStages, ariaLabel: "Stages" }),
      /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx14(Switch, { id: "fn-pct", checked: percent, onCheckedChange: setPercent }),
        /* @__PURE__ */ jsx14(Label, { htmlFor: "fn-pct", className: "text-xs text-muted-foreground", children: "Conversion %" })
      ] })
    ] }),
    /* @__PURE__ */ jsx14(ChartContainer, { config: {}, className: "h-64 w-full", children: /* @__PURE__ */ jsxs8(FunnelChart, { margin: { left: 8, right: 130 }, children: [
      /* @__PURE__ */ jsx14(ChartTooltip, { content: /* @__PURE__ */ jsx14(ChartTooltipContent, { hideLabel: true }) }),
      /* @__PURE__ */ jsx14(Funnel, { dataKey: "value", data: rows, children: /* @__PURE__ */ jsx14(LabelList, { position: "right", dataKey: "label", className: "fill-foreground", fontSize: 11 }) })
    ] }) })
  ] });
}
var WF_PERIODS = {
  H1: [
    { name: "Q1", delta: 40, kind: "total" },
    { name: "Mkt", delta: 12, kind: "up" },
    { name: "Ops", delta: -5, kind: "down" },
    { name: "Sales", delta: 18, kind: "up" },
    { name: "Refunds", delta: -8, kind: "down" },
    { name: "Q2", delta: 0, kind: "total" }
  ],
  H2: [
    { name: "Q3", delta: 57, kind: "total" },
    { name: "Mkt", delta: 9, kind: "up" },
    { name: "Ops", delta: -11, kind: "down" },
    { name: "Sales", delta: 24, kind: "up" },
    { name: "Refunds", delta: -4, kind: "down" },
    { name: "Q4", delta: 0, kind: "total" }
  ]
};
var wfFill = (kind) => kind === "total" ? TOKEN2[0] : kind === "up" ? TOKEN2[1] : TOKEN2[4];
var waterfallConfig = { delta: { label: "Change ($k)" } };
function buildWaterfall(steps) {
  let run = 0;
  return steps.map((s, i) => {
    if (s.kind === "total") {
      const value = i === 0 ? s.delta : run;
      if (i === 0) run = s.delta;
      return { name: s.name, base: 0, delta: value, kind: s.kind };
    }
    const base = s.delta >= 0 ? run : run + s.delta;
    run += s.delta;
    return { name: s.name, base, delta: Math.abs(s.delta), kind: s.kind };
  });
}
function ChartWaterfall({
  periods = WF_PERIODS,
  title = "Waterfall",
  description = "Running total decomposed into gains and losses; switch the period."
}) {
  const keys = Object.keys(periods);
  const [period, setPeriod] = React5.useState(keys[0]);
  const rows = buildWaterfall(periods[period]);
  return /* @__PURE__ */ jsxs8(ChartCard, { title, description, exportData: rows, children: [
    /* @__PURE__ */ jsxs8(ChartControls, { children: [
      /* @__PURE__ */ jsx14(SegmentedControl, { options: keys, value: period, onChange: setPeriod, ariaLabel: "Period" }),
      /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx14("span", { className: "size-2 rounded-full", style: { background: TOKEN2[1] } }),
          " gain"
        ] }),
        /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx14("span", { className: "size-2 rounded-full", style: { background: TOKEN2[4] } }),
          " loss"
        ] }),
        /* @__PURE__ */ jsxs8("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx14("span", { className: "size-2 rounded-full", style: { background: TOKEN2[0] } }),
          " total"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx14(ChartContainer, { config: waterfallConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs8(BarChart2, { data: rows, children: [
      /* @__PURE__ */ jsx14(CartesianGrid2, { vertical: false }),
      /* @__PURE__ */ jsx14(XAxis2, { dataKey: "name", tickLine: false, axisLine: false, tickMargin: 8 }),
      /* @__PURE__ */ jsx14(Bar2, { dataKey: "base", stackId: "w", fill: "transparent" }),
      /* @__PURE__ */ jsxs8(Bar2, { dataKey: "delta", stackId: "w", radius: 4, children: [
        rows.map((d) => /* @__PURE__ */ jsx14(Cell, { fill: wfFill(d.kind) }, d.name)),
        /* @__PURE__ */ jsx14(LabelList, { dataKey: "delta", position: "top", className: "fill-muted-foreground", fontSize: 10 })
      ] })
    ] }) })
  ] });
}
var STREAM_KEYS = ["s1", "s2", "s3", "s4"];
var STREAM_DATA = Array.from({ length: 13 }, (_, i) => ({
  i,
  s1: 4 + 3 * Math.sin(i / 1.7) + 3,
  s2: 3 + 2.4 * Math.sin(i / 2.3 + 1.4) + 2.6,
  s3: 2.5 + 2 * Math.sin(i / 1.4 + 2.8) + 2.2,
  s4: 2 + 1.6 * Math.sin(i / 2 + 4.1) + 1.8
}));
var OFFSETS = {
  wiggle: stackOffsetWiggle,
  silhouette: stackOffsetSilhouette,
  stacked: stackOffsetNone,
  expand: stackOffsetExpand
};
function ChartStreamgraph({
  title = "Streamgraph",
  description = "The same stack on four baselines \u2014 wiggle, silhouette, zero and 100%."
}) {
  const [mode, setMode] = React5.useState("wiggle");
  const W = 560;
  const H = 200;
  const layers = stack().keys(STREAM_KEYS).offset(OFFSETS[mode]).order(stackOrderInsideOut)(STREAM_DATA);
  let min = Infinity;
  let max = -Infinity;
  layers.forEach(
    (l) => l.forEach(([a, b]) => {
      min = Math.min(min, a);
      max = Math.max(max, b);
    })
  );
  const x = (i) => i / (STREAM_DATA.length - 1) * W;
  const y = (v) => (v - min) / (max - min || 1) * (H - 8) + 4;
  const areaGen = area().x((_, i) => x(i)).y0((d) => y(d[0])).y1((d) => y(d[1])).curve(curveBasis);
  return /* @__PURE__ */ jsxs8(ChartCard, { title, description, exportData: STREAM_DATA, children: [
    /* @__PURE__ */ jsx14(ChartControls, { children: /* @__PURE__ */ jsx14(
      SegmentedControl,
      {
        options: ["wiggle", "silhouette", "stacked", "expand"],
        value: mode,
        onChange: setMode,
        ariaLabel: "Baseline"
      }
    ) }),
    /* @__PURE__ */ jsx14("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: layers.map((l, i) => /* @__PURE__ */ jsx14("path", { d: areaGen(l) ?? "", fill: TOKEN2[i % 5], opacity: 0.8, children: /* @__PURE__ */ jsx14("title", { children: `Series ${l.key}` }) }, l.key)) })
  ] });
}
var SUN_TREE = {
  id: "root",
  children: [
    { id: "Alpha", children: [{ id: "A1", size: 9 }, { id: "A2", size: 6 }, { id: "A3", size: 4 }] },
    { id: "Beta", children: [{ id: "B1", size: 8 }, { id: "B2", size: 5 }, { id: "B3", size: 3 }, { id: "B4", size: 2 }] },
    { id: "Gamma", children: [{ id: "C1", size: 7 }, { id: "C2", size: 4 }] }
  ]
};
var SUN_GROUPS = ["Alpha", "Beta", "Gamma"];
function topGroup(n) {
  const a = n.ancestors();
  return (a[a.length - 2] ?? n).data.id;
}
function ChartSunburst({
  title = "Sunburst",
  description = "Click a group pill to focus its ring segment; click again to clear."
}) {
  const [focus, setFocus] = React5.useState(null);
  const R = 100;
  const root = hierarchy(SUN_TREE).sum((d) => d.size ?? 0);
  partition().size([2 * Math.PI, R * R])(root);
  const arcGen = arc().startAngle((d) => d.x0).endAngle((d) => d.x1).padAngle(0.012).innerRadius((d) => Math.sqrt(d.y0)).outerRadius((d) => Math.sqrt(d.y1) - 1.5);
  const nodes = root.descendants().filter((d) => d.depth > 0);
  return /* @__PURE__ */ jsxs8(
    ChartCard,
    {
      title,
      description,
      exportData: nodes.map((n) => ({ id: n.data.id, group: topGroup(n), value: n.value })),
      children: [
        /* @__PURE__ */ jsx14(ChartControls, { children: /* @__PURE__ */ jsx14("span", { className: "flex items-center gap-1.5", children: SUN_GROUPS.map((g, i) => /* @__PURE__ */ jsx14(
          FilterPill,
          {
            label: g,
            color: TOKEN2[i % 5],
            active: focus === null || focus === g,
            onClick: () => setFocus((f) => f === g ? null : g)
          },
          g
        )) }) }),
        /* @__PURE__ */ jsx14("svg", { viewBox: "-105 -105 210 210", className: "mx-auto w-full max-h-64", children: nodes.map((n) => {
          const g = topGroup(n);
          const gi = SUN_GROUPS.indexOf(g);
          const dim = focus !== null && focus !== g;
          return /* @__PURE__ */ jsx14(
            "path",
            {
              d: arcGen(n) ?? "",
              fill: TOKEN2[gi % 5],
              opacity: dim ? 0.12 : n.depth === 1 ? 0.95 : 0.55,
              style: { transition: "opacity var(--duration-fast) var(--ease-standard)" },
              children: /* @__PURE__ */ jsx14("title", { children: `${n.data.id}: ${n.value}` })
            },
            n.data.id
          );
        }) })
      ]
    }
  );
}

// components/charts/kpi.tsx
import * as React6 from "react";
import {
  Area as Area2,
  AreaChart as AreaChart2,
  Bar as Bar3,
  BarChart as BarChart4,
  Brush,
  CartesianGrid as CartesianGrid3,
  Line as Line2,
  LineChart as LineChart2,
  PolarAngleAxis as PolarAngleAxis2,
  RadialBar,
  RadialBarChart,
  XAxis as XAxis3,
  YAxis as YAxis2
} from "recharts";
import { jsx as jsx15, jsxs as jsxs9 } from "react/jsx-runtime";
var TOKEN3 = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
function ChartGauge({
  initialValue = 72,
  title = "Gauge",
  description = "Drag the slider \u2014 the arc recolours through the functional tokens.",
  unit = "health score"
}) {
  const [value, setValue] = React6.useState(initialValue);
  const color = value < 40 ? "var(--destructive)" : value < 70 ? "var(--warning)" : "var(--success)";
  const status = value < 40 ? "critical" : value < 70 ? "at risk" : "healthy";
  return /* @__PURE__ */ jsxs9(ChartCard, { title, description, exportData: [{ metric: unit, value, status }], children: [
    /* @__PURE__ */ jsxs9(ChartControls, { children: [
      /* @__PURE__ */ jsxs9("span", { className: "flex w-64 items-center gap-2", children: [
        /* @__PURE__ */ jsxs9(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Score ",
          value
        ] }),
        /* @__PURE__ */ jsx15(Slider, { value: [value], onValueChange: ([v]) => setValue(v), min: 0, max: 100, step: 1 })
      ] }),
      /* @__PURE__ */ jsx15("span", { className: "text-xs font-medium", style: { color }, children: status })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "relative h-64", children: [
      /* @__PURE__ */ jsx15(ChartContainer, { config: {}, className: "h-64 w-full", children: /* @__PURE__ */ jsxs9(
        RadialBarChart,
        {
          data: [{ name: "score", value }],
          startAngle: 210,
          endAngle: -30,
          innerRadius: 86,
          outerRadius: 108,
          children: [
            /* @__PURE__ */ jsx15(PolarAngleAxis2, { type: "number", domain: [0, 100], tick: false }),
            /* @__PURE__ */ jsx15(RadialBar, { dataKey: "value", fill: color, background: { fill: "var(--muted)" }, cornerRadius: 8 })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs9("div", { className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsx15("span", { className: "text-4xl font-bold tabular-nums text-foreground", children: value }),
        /* @__PURE__ */ jsx15("span", { className: "text-xs text-muted-foreground", children: unit })
      ] })
    ] })
  ] });
}
var BULLETS = [
  { label: "Revenue", value: 78, bands: [50, 75, 100] },
  { label: "NPS", value: 62, bands: [40, 60, 100] },
  { label: "Uptime", value: 96, bands: [90, 95, 100] }
];
function ChartBullet({
  data = BULLETS,
  title = "Bullet",
  description = "Measure vs qualitative bands; move the shared target line."
}) {
  const [target, setTarget] = React6.useState(85);
  const W = 560;
  const rowH = 48;
  const barH = 13;
  return /* @__PURE__ */ jsxs9(
    ChartCard,
    {
      title,
      description,
      exportData: data.map((b) => ({ label: b.label, value: b.value, target })),
      children: [
        /* @__PURE__ */ jsx15(ChartControls, { children: /* @__PURE__ */ jsxs9("span", { className: "flex w-64 items-center gap-2", children: [
          /* @__PURE__ */ jsxs9(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
            "Target ",
            target
          ] }),
          /* @__PURE__ */ jsx15(Slider, { value: [target], onValueChange: ([v]) => setTarget(v), min: 20, max: 100, step: 1 })
        ] }) }),
        /* @__PURE__ */ jsx15("svg", { viewBox: `0 0 ${W} ${data.length * rowH}`, className: "w-full", children: data.map((b, i) => {
          const y = i * rowH + 16;
          const px = (v) => 76 + v / 100 * (W - 90);
          const hit = b.value >= target;
          return /* @__PURE__ */ jsxs9("g", { children: [
            /* @__PURE__ */ jsx15("title", { children: `${b.label}: ${b.value} (target ${target})` }),
            /* @__PURE__ */ jsx15("text", { x: 68, y: y + barH - 2, textAnchor: "end", fontSize: 10, fill: "var(--muted-foreground)", children: b.label }),
            b.bands.map((band, j) => {
              const prev = j === 0 ? 0 : b.bands[j - 1];
              return /* @__PURE__ */ jsx15("rect", { x: px(prev), y, width: px(band) - px(prev), height: barH, fill: "var(--muted-foreground)", opacity: 0.14 + j * 0.1 }, j);
            }),
            /* @__PURE__ */ jsx15("rect", { x: px(0), y: y + 3, width: px(b.value) - px(0), height: barH - 6, rx: 2, fill: hit ? "var(--success)" : "var(--chart-1)" }),
            /* @__PURE__ */ jsx15("line", { x1: px(target), x2: px(target), y1: y - 4, y2: y + barH + 4, stroke: "var(--foreground)", strokeWidth: 2 })
          ] }, b.label);
        }) })
      ]
    }
  );
}
var SPARK = Array.from({ length: 20 }, (_, i) => ({
  i,
  sessions: Math.round(400 + 180 * Math.sin(i / 2.1) + i * 14),
  signups: Math.round(120 + 48 * Math.cos(i / 1.7) + i * 2.4),
  errors: Math.round((4 + 2 * Math.sin(i / 1.2 + 2) + (i % 5 === 0 ? 3 : 0)) * 10) / 10
}));
var METRICS = {
  sessions: { label: "Sessions", color: TOKEN3[0], kind: "area", fmt: (v) => `${(v / 1e3).toFixed(1)}k` },
  signups: { label: "Sign-ups", color: TOKEN3[1], kind: "line", fmt: (v) => `${v}` },
  errors: { label: "Errors", color: TOKEN3[4], kind: "bar", fmt: (v) => `${v}%` }
};
function ChartSparkline({
  title = "Sparkline",
  description = "One stat card, three metrics \u2014 each with its own micro-chart idiom."
}) {
  const [metric, setMetric] = React6.useState("sessions");
  const m = METRICS[metric];
  const latest = SPARK[SPARK.length - 1][metric];
  const first = SPARK[0][metric];
  const change = Math.round((latest - first) / first * 100);
  const cfg = { [metric]: { label: m.label, color: m.color } };
  return /* @__PURE__ */ jsxs9(ChartCard, { title, description, exportData: SPARK, children: [
    /* @__PURE__ */ jsx15(ChartControls, { children: /* @__PURE__ */ jsx15(SegmentedControl, { options: ["sessions", "signups", "errors"], value: metric, onChange: setMetric, ariaLabel: "Metric" }) }),
    /* @__PURE__ */ jsxs9("div", { className: "rounded-lg border border-border p-4", children: [
      /* @__PURE__ */ jsx15("p", { className: "text-xs text-muted-foreground", children: m.label }),
      /* @__PURE__ */ jsxs9("p", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx15("span", { className: "text-2xl font-semibold tabular-nums text-foreground", children: m.fmt(latest) }),
        /* @__PURE__ */ jsxs9("span", { className: "text-xs font-medium", style: { color: change >= 0 ? "var(--success)" : "var(--destructive)" }, children: [
          change >= 0 ? "\u25B2" : "\u25BC",
          " ",
          Math.abs(change),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx15(ChartContainer, { config: cfg, className: "mt-2 h-16 w-full", children: m.kind === "area" ? /* @__PURE__ */ jsxs9(AreaChart2, { data: SPARK, margin: { top: 2, bottom: 2, left: 0, right: 0 }, children: [
        /* @__PURE__ */ jsx15(ChartTooltip, { content: /* @__PURE__ */ jsx15(ChartTooltipContent, { hideLabel: true }) }),
        /* @__PURE__ */ jsx15(Area2, { dataKey: metric, type: "monotone", stroke: m.color, fill: m.color, fillOpacity: 0.2, strokeWidth: 1.5 })
      ] }) : m.kind === "line" ? /* @__PURE__ */ jsxs9(LineChart2, { data: SPARK, margin: { top: 2, bottom: 2, left: 0, right: 0 }, children: [
        /* @__PURE__ */ jsx15(ChartTooltip, { content: /* @__PURE__ */ jsx15(ChartTooltipContent, { hideLabel: true }) }),
        /* @__PURE__ */ jsx15(Line2, { dataKey: metric, type: "monotone", stroke: m.color, dot: false, strokeWidth: 1.5 })
      ] }) : /* @__PURE__ */ jsxs9(BarChart4, { data: SPARK, margin: { top: 2, bottom: 2, left: 0, right: 0 }, children: [
        /* @__PURE__ */ jsx15(ChartTooltip, { content: /* @__PURE__ */ jsx15(ChartTooltipContent, { hideLabel: true }) }),
        /* @__PURE__ */ jsx15(Bar3, { dataKey: metric, fill: m.color, radius: 1 })
      ] }) })
    ] })
  ] });
}
var BRUSH_RAW = Array.from({ length: 64 }, (_, i) => ({
  x: `W${i + 1}`,
  v: Math.round(50 + 24 * Math.sin(i / 4.2) + 12 * Math.sin(i / 1.6) + i * 0.5)
}));
var brushConfig = {
  v: { label: "Raw", color: "var(--chart-1)" },
  smooth: { label: "Smoothed", color: "var(--chart-3)" }
};
function smoothRows(data, win) {
  return data.map((d, i) => {
    const lo = Math.max(0, i - Math.floor(win / 2));
    const hi = Math.min(data.length, i + Math.ceil(win / 2));
    const seg = data.slice(lo, hi);
    return { ...d, smooth: Math.round(seg.reduce((a, p) => a + p.v, 0) / seg.length) };
  });
}
function ChartBrush({
  title = "Brush & Zoom",
  description = "Drag the brush handles to zoom; smooth the series with a moving average."
}) {
  const [win, setWin] = React6.useState("5");
  const [showRaw, setShowRaw] = React6.useState(true);
  const rows = smoothRows(BRUSH_RAW, Number(win));
  return /* @__PURE__ */ jsxs9(ChartCard, { title, description, exportData: rows, children: [
    /* @__PURE__ */ jsxs9(ChartControls, { children: [
      /* @__PURE__ */ jsx15(SegmentedControl, { options: ["1", "5", "9"], value: win, onChange: setWin, ariaLabel: "Smoothing window" }),
      /* @__PURE__ */ jsxs9("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx15(Switch, { id: "br-raw", checked: showRaw, onCheckedChange: setShowRaw }),
        /* @__PURE__ */ jsx15(Label, { htmlFor: "br-raw", className: "text-xs text-muted-foreground", children: "Show raw" })
      ] })
    ] }),
    /* @__PURE__ */ jsx15(ChartContainer, { config: brushConfig, className: "h-64 w-full", children: /* @__PURE__ */ jsxs9(LineChart2, { data: rows, margin: { left: 0, right: 8 }, children: [
      /* @__PURE__ */ jsx15(CartesianGrid3, { vertical: false }),
      /* @__PURE__ */ jsx15(XAxis3, { dataKey: "x", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 24 }),
      /* @__PURE__ */ jsx15(YAxis2, { tickLine: false, axisLine: false, width: 30 }),
      /* @__PURE__ */ jsx15(ChartTooltip, { content: /* @__PURE__ */ jsx15(ChartTooltipContent, {}) }),
      showRaw && /* @__PURE__ */ jsx15(Line2, { dataKey: "v", type: "monotone", stroke: "var(--chart-1)", strokeWidth: 1.2, dot: false, opacity: 0.5 }),
      /* @__PURE__ */ jsx15(Line2, { dataKey: "smooth", type: "monotone", stroke: "var(--chart-3)", strokeWidth: 2.2, dot: false }),
      /* @__PURE__ */ jsx15(Brush, { dataKey: "x", height: 20, travellerWidth: 8, stroke: "var(--chart-1)", fill: "var(--muted)" })
    ] }) })
  ] });
}
function makeCandles(n) {
  const out = [];
  let prev = 100;
  for (let i = 0; i < n; i++) {
    const o = prev;
    const c = o + 7 * Math.sin(i / 1.3 + 0.7) + 2.5 * Math.cos(i / 0.7);
    const h = Math.max(o, c) + 2 + 2 * Math.abs(Math.sin(i));
    const l = Math.min(o, c) - 2 - 2 * Math.abs(Math.cos(i * 1.7));
    out.push({ o, c, h, l });
    prev = c;
  }
  return out;
}
function ChartCandlestick({
  title = "Candlestick",
  description = "OHLC sessions \u2014 change the window length and hover for the readout."
}) {
  const [count, setCount] = React6.useState("18");
  const [hover, setHover] = React6.useState(null);
  const candles = makeCandles(Number(count));
  const W = 560;
  const H = 210;
  const min = Math.min(...candles.map((d) => d.l));
  const max = Math.max(...candles.map((d) => d.h));
  const y = (v) => H - 8 - (v - min) / (max - min) * (H - 16);
  const step = W / candles.length;
  return /* @__PURE__ */ jsxs9(
    ChartCard,
    {
      title,
      description,
      exportData: candles.map((d, i) => ({ session: i + 1, open: d.o.toFixed(2), high: d.h.toFixed(2), low: d.l.toFixed(2), close: d.c.toFixed(2) })),
      children: [
        /* @__PURE__ */ jsxs9(ChartControls, { children: [
          /* @__PURE__ */ jsx15(SegmentedControl, { options: ["12", "18", "30"], value: count, onChange: setCount, ariaLabel: "Sessions" }),
          /* @__PURE__ */ jsx15("span", { className: "font-mono text-xs text-muted-foreground min-w-56", children: hover ?? "hover a candle" })
        ] }),
        /* @__PURE__ */ jsx15("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: candles.map((d, i) => {
          const cx = i * step + step / 2;
          const up = d.c >= d.o;
          const color = up ? "var(--success)" : "var(--destructive)";
          return /* @__PURE__ */ jsxs9(
            "g",
            {
              onMouseEnter: () => setHover(`#${i + 1}  O ${d.o.toFixed(1)}  H ${d.h.toFixed(1)}  L ${d.l.toFixed(1)}  C ${d.c.toFixed(1)}`),
              onMouseLeave: () => setHover(null),
              children: [
                /* @__PURE__ */ jsx15("title", { children: `O ${d.o.toFixed(1)}  H ${d.h.toFixed(1)}  L ${d.l.toFixed(1)}  C ${d.c.toFixed(1)}` }),
                /* @__PURE__ */ jsx15("line", { x1: cx, x2: cx, y1: y(d.h), y2: y(d.l), stroke: color, strokeWidth: 1.2 }),
                /* @__PURE__ */ jsx15(
                  "rect",
                  {
                    x: cx - step * 0.28,
                    y: y(Math.max(d.o, d.c)),
                    width: step * 0.56,
                    height: Math.max(2, Math.abs(y(d.o) - y(d.c))),
                    rx: 1.5,
                    fill: color
                  }
                )
              ]
            },
            i
          );
        }) })
      ]
    }
  );
}

// components/charts/distributions.tsx
import * as React7 from "react";
import { jsx as jsx16, jsxs as jsxs10 } from "react/jsx-runtime";
var TOKEN4 = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
var rnd = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
var normalish = (i, s) => rnd(i, s) + rnd(i + 7, s * 2) + rnd(i + 13, s * 3) + rnd(i + 29, s * 5) - 2;
var sample = (n, seed, mu, sd) => Array.from({ length: n }, (_, i) => mu + normalish(i, seed) * sd);
var SAMPLES = {
  Alpha: sample(80, 1, 50, 16),
  Beta: sample(80, 2, 58, 11),
  Gamma: sample(80, 3, 42, 19)
};
var GROUP_NAMES = Object.keys(SAMPLES);
var quantile = (sorted, p) => {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};
var kde = (values, bw) => (x) => values.reduce((acc, v) => acc + Math.exp(-0.5 * ((x - v) / bw) ** 2), 0) / (values.length * bw * Math.sqrt(2 * Math.PI));
var sampleCsv = (g) => SAMPLES[g].map((v, i) => ({ index: i, group: g, value: v.toFixed(2) }));
function ChartHistogram({
  title = "Histogram",
  description = "Slide the bin count to see how binning changes the story."
}) {
  const [bins, setBins] = React7.useState(14);
  const [group, setGroup] = React7.useState("Alpha");
  const data = SAMPLES[group];
  const W = 560, H = 200;
  const min = Math.min(...data), max = Math.max(...data);
  const counts = Array(bins).fill(0);
  data.forEach((v) => counts[Math.min(bins - 1, Math.floor((v - min) / (max - min) * bins))]++);
  const peak = Math.max(...counts);
  const bw = W / bins;
  const gi = GROUP_NAMES.indexOf(group);
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: sampleCsv(group), children: [
    /* @__PURE__ */ jsxs10(ChartControls, { children: [
      /* @__PURE__ */ jsx16(SegmentedControl, { options: GROUP_NAMES, value: group, onChange: setGroup, ariaLabel: "Sample" }),
      /* @__PURE__ */ jsxs10("span", { className: "flex w-52 items-center gap-2", children: [
        /* @__PURE__ */ jsxs10(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          bins,
          " bins"
        ] }),
        /* @__PURE__ */ jsx16(Slider, { value: [bins], onValueChange: ([v]) => setBins(v), min: 4, max: 32, step: 1 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs10("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: [
      /* @__PURE__ */ jsx16("line", { x1: 0, x2: W, y1: H - 14, y2: H - 14, stroke: "var(--border)" }),
      counts.map((c, i) => {
        const h = c / peak * (H - 26);
        return /* @__PURE__ */ jsx16("rect", { x: i * bw + 1.5, y: H - 14 - h, width: Math.max(1, bw - 3), height: h, rx: 2.5, fill: TOKEN4[gi], opacity: 0.85, children: /* @__PURE__ */ jsx16("title", { children: `${c} values` }) }, i);
      }),
      /* @__PURE__ */ jsx16("text", { x: 2, y: H - 2, fontSize: 8, fontFamily: "monospace", fill: "var(--muted-foreground)", children: Math.round(min) }),
      /* @__PURE__ */ jsx16("text", { x: W - 2, y: H - 2, textAnchor: "end", fontSize: 8, fontFamily: "monospace", fill: "var(--muted-foreground)", children: Math.round(max) })
    ] })
  ] });
}
function ChartBoxPlot({
  title = "Box Plot",
  description = "Toggle groups; show or hide points beyond the 1.5\xB7IQR whiskers."
}) {
  const [on, setOn] = React7.useState({ Alpha: true, Beta: true, Gamma: true });
  const [outliers, setOutliers] = React7.useState(true);
  const groups = GROUP_NAMES.filter((g) => on[g]);
  const all = groups.flatMap((g) => SAMPLES[g]);
  const W = 560, H = 230;
  const lo = Math.min(...all.length ? all : [0]), hi = Math.max(...all.length ? all : [100]);
  const y = (v) => H - 26 - (v - lo) / (hi - lo || 1) * (H - 44);
  const slot = W / (groups.length + 1);
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: groups.flatMap(sampleCsv), children: [
    /* @__PURE__ */ jsxs10(ChartControls, { children: [
      /* @__PURE__ */ jsx16("span", { className: "flex items-center gap-1.5", children: GROUP_NAMES.map((g, i) => /* @__PURE__ */ jsx16(FilterPill, { label: g, color: TOKEN4[i], active: on[g], onClick: () => setOn((s) => ({ ...s, [g]: !s[g] })) }, g)) }),
      /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx16(Switch, { id: "bp-out", checked: outliers, onCheckedChange: setOutliers }),
        /* @__PURE__ */ jsx16(Label, { htmlFor: "bp-out", className: "text-xs text-muted-foreground", children: "Outliers" })
      ] })
    ] }),
    /* @__PURE__ */ jsx16("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: groups.map((g, i) => {
      const gi = GROUP_NAMES.indexOf(g);
      const s = [...SAMPLES[g]].sort((a, b) => a - b);
      const q1 = quantile(s, 0.25), q2 = quantile(s, 0.5), q3 = quantile(s, 0.75);
      const iqr = q3 - q1;
      const loW = q1 - 1.5 * iqr, hiW = q3 + 1.5 * iqr;
      const wLo = Math.max(s[0], loW), wHi = Math.min(s[s.length - 1], hiW);
      const outs = s.filter((v) => v < loW || v > hiW);
      const cx = slot * (i + 1);
      return /* @__PURE__ */ jsxs10("g", { children: [
        /* @__PURE__ */ jsx16("title", { children: `${g} \u2014 median ${Math.round(q2)}, IQR ${Math.round(q1)}\u2013${Math.round(q3)}` }),
        /* @__PURE__ */ jsx16("line", { x1: cx, x2: cx, y1: y(wHi), y2: y(wLo), stroke: TOKEN4[gi], strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx16("line", { x1: cx - 18, x2: cx + 18, y1: y(wHi), y2: y(wHi), stroke: TOKEN4[gi], strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx16("line", { x1: cx - 18, x2: cx + 18, y1: y(wLo), y2: y(wLo), stroke: TOKEN4[gi], strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx16("rect", { x: cx - 30, y: y(q3), width: 60, height: y(q1) - y(q3), rx: 4, fill: TOKEN4[gi], opacity: 0.35, stroke: TOKEN4[gi], strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx16("line", { x1: cx - 30, x2: cx + 30, y1: y(q2), y2: y(q2), stroke: TOKEN4[gi], strokeWidth: 2.5 }),
        outliers && outs.map((v, k) => /* @__PURE__ */ jsx16("circle", { cx: cx + (k % 2 ? 6 : -6), cy: y(v), r: 2.5, fill: "none", stroke: TOKEN4[gi], strokeWidth: 1.2 }, k)),
        /* @__PURE__ */ jsx16("text", { x: cx, y: H - 8, textAnchor: "middle", fontSize: 10, fill: "var(--muted-foreground)", children: g })
      ] }, g);
    }) })
  ] });
}
function ChartViolin({
  title = "Violin",
  description = "The kernel bandwidth trades smoothness against detail."
}) {
  const [bw, setBw] = React7.useState(6);
  const W = 560, H = 230;
  const all = GROUP_NAMES.flatMap((g) => SAMPLES[g]);
  const lo = Math.min(...all) - 6, hi = Math.max(...all) + 6;
  const y = (v) => H - 26 - (v - lo) / (hi - lo) * (H - 44);
  const slot = W / (GROUP_NAMES.length + 1);
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: GROUP_NAMES.flatMap(sampleCsv), children: [
    /* @__PURE__ */ jsx16(ChartControls, { children: /* @__PURE__ */ jsxs10("span", { className: "flex w-56 items-center gap-2", children: [
      /* @__PURE__ */ jsxs10(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
        "Bandwidth ",
        bw
      ] }),
      /* @__PURE__ */ jsx16(Slider, { value: [bw], onValueChange: ([v]) => setBw(v), min: 2, max: 16, step: 1 })
    ] }) }),
    /* @__PURE__ */ jsx16("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: GROUP_NAMES.map((g, i) => {
      const f = kde(SAMPLES[g], bw);
      const steps = Array.from({ length: 50 }, (_, k) => lo + (hi - lo) * k / 49);
      const peak = Math.max(...steps.map(f));
      const cx = slot * (i + 1);
      const half = (v) => f(v) / peak * 44;
      const right = steps.map((v) => `${cx + half(v)},${y(v)}`).join(" L");
      const left = [...steps].reverse().map((v) => `${cx - half(v)},${y(v)}`).join(" L");
      return /* @__PURE__ */ jsxs10("g", { children: [
        /* @__PURE__ */ jsx16("title", { children: `${g} \u2014 n=${SAMPLES[g].length}` }),
        /* @__PURE__ */ jsx16("path", { d: `M${right} L${left} Z`, fill: TOKEN4[i], opacity: 0.5, stroke: TOKEN4[i], strokeWidth: 1.2 }),
        /* @__PURE__ */ jsx16("text", { x: cx, y: H - 8, textAnchor: "middle", fontSize: 10, fill: "var(--muted-foreground)", children: g })
      ] }, g);
    }) })
  ] });
}
function ChartBeeswarm({
  title = "Beeswarm",
  description = "Every point shown; the radius controls packing density."
}) {
  const [group, setGroup] = React7.useState("Alpha");
  const [radius, setRadius] = React7.useState(4);
  const data = SAMPLES[group];
  const gi = GROUP_NAMES.indexOf(group);
  const W = 560, H = 190;
  const lo = Math.min(...data), hi = Math.max(...data);
  const x = (v) => 12 + (v - lo) / (hi - lo) * (W - 24);
  const placed = [];
  const pts = [...data].sort((a, b) => a - b).map((v) => {
    const px = x(v);
    let row = 0;
    const collides = (yy2) => placed.some((p) => Math.abs(p.x - px) < radius * 2 && Math.abs(p.y - yy2) < radius * 2);
    let yy = H / 2;
    while (collides(yy)) {
      row = row >= 0 ? -(row + 1) : -row;
      yy = H / 2 + row * (radius * 2 + 1);
    }
    placed.push({ x: px, y: yy });
    return { x: px, y: yy, v };
  });
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: sampleCsv(group), children: [
    /* @__PURE__ */ jsxs10(ChartControls, { children: [
      /* @__PURE__ */ jsx16(SegmentedControl, { options: GROUP_NAMES, value: group, onChange: setGroup, ariaLabel: "Sample" }),
      /* @__PURE__ */ jsxs10("span", { className: "flex w-48 items-center gap-2", children: [
        /* @__PURE__ */ jsxs10(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "r = ",
          radius
        ] }),
        /* @__PURE__ */ jsx16(Slider, { value: [radius], onValueChange: ([v]) => setRadius(v), min: 2, max: 8, step: 1 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs10("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: [
      /* @__PURE__ */ jsx16("line", { x1: 8, x2: W - 8, y1: H / 2, y2: H / 2, stroke: "var(--border)", strokeDasharray: "3 3" }),
      pts.map((p, i) => /* @__PURE__ */ jsx16("circle", { cx: p.x, cy: p.y, r: radius, fill: TOKEN4[gi], opacity: 0.8, children: /* @__PURE__ */ jsx16("title", { children: p.v.toFixed(1) }) }, i))
    ] })
  ] });
}
function ChartWaffle({
  title = "Waffle",
  description = "Two sliders, one honest part-to-whole \u2014 referral takes the remainder."
}) {
  const [organic, setOrganic] = React7.useState(46);
  const [paid, setPaid] = React7.useState(32);
  const referral = Math.max(0, 100 - organic - paid);
  const clampedPaid = Math.min(paid, 100 - organic);
  const parts = [
    { name: "Organic", n: organic, color: TOKEN4[0] },
    { name: "Paid", n: clampedPaid, color: TOKEN4[2] },
    { name: "Referral", n: referral, color: TOKEN4[1] }
  ];
  const cells = parts.flatMap((p) => Array(p.n).fill(p));
  const size = 15;
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: parts.map(({ name, n }) => ({ name, percent: n })), children: [
    /* @__PURE__ */ jsxs10(ChartControls, { children: [
      /* @__PURE__ */ jsxs10("span", { className: "flex w-52 items-center gap-2", children: [
        /* @__PURE__ */ jsxs10(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Organic ",
          organic,
          "%"
        ] }),
        /* @__PURE__ */ jsx16(Slider, { value: [organic], onValueChange: ([v]) => setOrganic(v), min: 0, max: 100, step: 1 })
      ] }),
      /* @__PURE__ */ jsxs10("span", { className: "flex w-52 items-center gap-2", children: [
        /* @__PURE__ */ jsxs10(Label, { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
          "Paid ",
          clampedPaid,
          "%"
        ] }),
        /* @__PURE__ */ jsx16(Slider, { value: [paid], onValueChange: ([v]) => setPaid(v), min: 0, max: 100, step: 1 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "flex items-center justify-center gap-8", children: [
      /* @__PURE__ */ jsx16("svg", { viewBox: `0 0 ${10 * size} ${10 * size}`, className: "h-48", children: cells.slice(0, 100).map((p, i) => /* @__PURE__ */ jsx16(
        "rect",
        {
          x: i % 10 * size + 1.5,
          y: Math.floor(i / 10) * size + 1.5,
          width: size - 3,
          height: size - 3,
          rx: 3,
          fill: p.color,
          children: /* @__PURE__ */ jsx16("title", { children: `${p.name} \u2014 ${p.n}%` })
        },
        i
      )) }),
      /* @__PURE__ */ jsx16("div", { className: "space-y-2", children: parts.map((p) => /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx16("span", { className: "size-3 rounded-sm", style: { background: p.color } }),
        /* @__PURE__ */ jsx16("span", { className: "text-muted-foreground", children: p.name }),
        /* @__PURE__ */ jsxs10("span", { className: "font-mono text-xs text-foreground", children: [
          p.n,
          "%"
        ] })
      ] }, p.name)) })
    ] })
  ] });
}
var DUMBBELL = [
  { name: "AMER", a: 42, b: 61 },
  { name: "EMEA", a: 38, b: 49 },
  { name: "APAC", a: 25, b: 47 },
  { name: "LATAM", a: 18, b: 26 },
  { name: "MEA", a: 12, b: 21 }
];
function ChartDumbbell({
  data = DUMBBELL,
  title = "Dumbbell",
  description = "Before/after per region; re-rank by name, change or latest value."
}) {
  const [sort, setSort] = React7.useState("name");
  const rows = [...data].sort(
    (p, q) => sort === "name" ? p.name.localeCompare(q.name) : sort === "change" ? q.b - q.a - (p.b - p.a) : q.b - p.b
  );
  const W = 560, H = 210;
  const x = (v) => 76 + v / 70 * (W - 100);
  return /* @__PURE__ */ jsxs10(ChartCard, { title, description, exportData: rows, children: [
    /* @__PURE__ */ jsxs10(ChartControls, { children: [
      /* @__PURE__ */ jsx16(SegmentedControl, { options: ["name", "change", "latest"], value: sort, onChange: setSort, ariaLabel: "Sort" }),
      /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx16("span", { className: "size-2 rounded-full", style: { background: TOKEN4[0] } }),
          " 2024"
        ] }),
        /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx16("span", { className: "size-2 rounded-full", style: { background: TOKEN4[2] } }),
          " 2026"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx16("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", children: rows.map((d, i) => {
      const yy = 26 + i * 38;
      return /* @__PURE__ */ jsxs10("g", { children: [
        /* @__PURE__ */ jsx16("title", { children: `${d.name}: ${d.a} \u2192 ${d.b} (+${d.b - d.a})` }),
        /* @__PURE__ */ jsx16("text", { x: 68, y: yy + 3, textAnchor: "end", fontSize: 10, fill: "var(--muted-foreground)", children: d.name }),
        /* @__PURE__ */ jsx16("line", { x1: x(d.a), x2: x(d.b), y1: yy, y2: yy, stroke: "var(--border)", strokeWidth: 2.5 }),
        /* @__PURE__ */ jsx16("circle", { cx: x(d.a), cy: yy, r: 6, fill: TOKEN4[0] }),
        /* @__PURE__ */ jsx16("circle", { cx: x(d.b), cy: yy, r: 6, fill: TOKEN4[2] }),
        /* @__PURE__ */ jsxs10("text", { x: x(d.b) + 12, y: yy + 3, fontSize: 9, fontFamily: "monospace", fill: "var(--muted-foreground)", children: [
          "+",
          d.b - d.a
        ] })
      ] }, d.name);
    }) })
  ] });
}

// components/charts/network.tsx
import * as React8 from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import avsdf from "cytoscape-avsdf";
import { jsx as jsx17, jsxs as jsxs11 } from "react/jsx-runtime";
try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(avsdf);
} catch {
}
var NODES = [
  { id: "h1", label: "Cognition", group: 0 },
  { id: "h2", label: "Memory systems", group: 1 },
  { id: "h3", label: "Attention", group: 2 },
  { id: "a1", label: "Working memory", group: 0 },
  { id: "a2", label: "Encoding", group: 0 },
  { id: "a3", label: "Retrieval", group: 0 },
  { id: "b1", label: "Hippocampus", group: 1 },
  { id: "b2", label: "Consolidation", group: 1 },
  { id: "b3", label: "Forgetting", group: 1 },
  { id: "c1", label: "Salience", group: 2 },
  { id: "c2", label: "Top-down control", group: 2 },
  { id: "c3", label: "Distraction", group: 2 },
  { id: "d1", label: "Sleep", group: 1 },
  { id: "d2", label: "Reward", group: 2 }
];
var EDGES = [
  ["h1", "h2"],
  ["h1", "h3"],
  ["h2", "h3"],
  ["h1", "a1"],
  ["h1", "a2"],
  ["h1", "a3"],
  ["a1", "a2"],
  ["a2", "a3"],
  ["h2", "b1"],
  ["h2", "b2"],
  ["h2", "b3"],
  ["b1", "b2"],
  ["b2", "b3"],
  ["h3", "c1"],
  ["h3", "c2"],
  ["h3", "c3"],
  ["c1", "c2"],
  ["c2", "c3"],
  ["b2", "d1"],
  ["d1", "a2"],
  ["c1", "d2"],
  ["d2", "h1"],
  ["a3", "b3"]
];
var LAYOUTS = ["force", "hierarchy", "circle", "concentric", "grid"];
var EDGE_STYLES = ["straight", "curved"];
function oklchToRgb(str) {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return str;
  let L = parseFloat(m[1]);
  if (m[1].includes("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  const hr = H * Math.PI / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  let l = L + 0.3963377774 * a + 0.2158037573 * b;
  let mm = L - 0.1055613458 * a - 0.0638541728 * b;
  let s = L - 0.0894841775 * a - 1.291485548 * b;
  l = l * l * l;
  mm = mm * mm * mm;
  s = s * s * s;
  const lr = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const gamma = (x) => x <= 31308e-7 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
  const ch = (x) => Math.max(0, Math.min(255, Math.round(gamma(x) * 255)));
  return `rgb(${ch(lr)}, ${ch(lg)}, ${ch(lb)})`;
}
function resolvedBg(el) {
  let node = el;
  for (let i = 0; node && i < 5; i++, node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) return bg;
  }
  return "";
}
function resolvedVar(el, name, fallback) {
  try {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
    probe.style.color = `var(${name})`;
    el.appendChild(probe);
    const c = getComputedStyle(probe).color;
    el.removeChild(probe);
    return c && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(c) ? c : fallback;
  } catch {
    return fallback;
  }
}
function isDarkColor(rgb) {
  const m = rgb.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!m) return false;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
function readTokens(el) {
  const cs = getComputedStyle(el);
  const v = (n, fb) => {
    const raw = cs.getPropertyValue(n).trim() || fb;
    return raw.toLowerCase().startsWith("oklch") ? oklchToRgb(raw) : raw;
  };
  const bg = v("--background", "#fff");
  const fg = v("--foreground", "#111");
  return {
    c: [1, 2, 3, 4, 5].map((i) => v(`--chart-${i}`, "#888")),
    border: v("--border", "#ddd"),
    fg,
    mutedF: v("--muted-foreground", "#888"),
    bg,
    // A guaranteed-parseable, theme-correct chip background: prefer the actual
    // rendered pixels; if nothing concrete is found (token is an unparseable
    // triplet / the canvas is the UA default), derive it from the FOREGROUND —
    // dark fg ⇒ light canvas, light fg ⇒ dark canvas. Never an unparseable string.
    bgSolid: resolvedBg(el) || (isDarkColor(fg) ? "#ffffff" : "#111111"),
    // AI-provenance accent (Tenet 9), resolved through the --rose → --crimson-9
    // chain to a concrete colour the canvas can paint.
    rose: resolvedVar(el, "--rose", "#d6336c"),
    primary: v("--primary", "#333"),
    // A RESOLVED font stack (the active layer's font). Cytoscape paints labels
    // to <canvas> and can't measure the CSS keyword "inherit", which silently
    // wedges the label texture so font-size changes never re-raster.
    font: cs.fontFamily || "system-ui, sans-serif"
  };
}
function ChartNetwork({
  title = "Network graph",
  description = "Switch layouts, tune the force physics, size nodes by degree, and click a node to isolate its neighbourhood."
}) {
  const hostRef = React8.useRef(null);
  const cyRef = React8.useRef(null);
  const [layout, setLayout] = React8.useState("force");
  const [gravity, setGravity] = React8.useState(45);
  const [linkDist, setLinkDist] = React8.useState(60);
  const [labelSize, setLabelSize] = React8.useState(12);
  const [nodeSize, setNodeSize] = React8.useState(26);
  const [sizeByDegree, setSizeByDegree] = React8.useState(true);
  const [labels, setLabels] = React8.useState(true);
  const [minDeg, setMinDeg] = React8.useState(0);
  const [edgeStyle, setEdgeStyle] = React8.useState("curved");
  const [arrows, setArrows] = React8.useState(false);
  const [tip, setTip] = React8.useState(null);
  const buildStyle = React8.useCallback(
    (t) => [
      {
        selector: "node",
        style: {
          // Per-group fill via data(color) — the canonical, reliable cytoscape
          // mapping (function-value mappers silently render mono on canvas).
          "background-color": "data(color)",
          width: sizeByDegree ? "mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" : nodeSize,
          height: sizeByDegree ? "mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" : nodeSize,
          label: labels ? "data(label)" : "",
          color: t.fg,
          "font-size": `${labelSize}px`,
          "font-family": t.font,
          "min-zoomed-font-size": 4,
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": 4,
          "text-wrap": "ellipsis",
          "text-max-width": "90px",
          "border-width": 1.5,
          "border-color": t.bg
        }
      },
      {
        selector: "edge",
        style: {
          width: 1.4,
          "line-color": t.border,
          // A single bezier edge between two nodes renders straight (it only
          // curves when several edges share a node pair). unbundled-bezier with
          // an explicit control-point distance gives every edge a visible arc.
          "curve-style": edgeStyle === "curved" ? "unbundled-bezier" : "straight",
          "control-point-distances": edgeStyle === "curved" ? 32 : 0,
          "control-point-weights": 0.5,
          "target-arrow-color": t.mutedF,
          "target-arrow-shape": arrows ? "triangle" : "none",
          "arrow-scale": 0.8,
          opacity: 0.85
        }
      },
      { selector: "node.faded", style: { opacity: 0.12 } },
      { selector: "edge.faded", style: { opacity: 0.05 } },
      {
        selector: "node.hl",
        style: { "border-color": t.primary, "border-width": 2.5 }
      },
      { selector: "edge.hl", style: { "line-color": t.primary, width: 2.2, opacity: 1 } },
      {
        selector: "node.hidden",
        style: { display: "none" }
      }
    ],
    [sizeByDegree, nodeSize, labels, labelSize, edgeStyle, arrows]
  );
  const layoutOpts = React8.useCallback(() => {
    const animate = false;
    switch (layout) {
      case "hierarchy":
        return { name: "dagre", rankDir: "TB", nodeSep: 26, rankSep: 18 + linkDist, animate };
      case "circle":
        return { name: "avsdf", nodeSeparation: 12 + linkDist * 0.6, animate };
      case "concentric":
        return {
          name: "concentric",
          concentric: (n) => n.degree(false),
          levelWidth: () => 2,
          minNodeSpacing: 18 + linkDist * 0.4,
          animate
        };
      case "grid":
        return { name: "grid", avoidOverlap: true, animate };
      case "force":
      default:
        return {
          name: "fcose",
          quality: "default",
          nodeRepulsion: () => 4500,
          idealEdgeLength: () => 30 + linkDist,
          gravity: gravity / 50,
          animate,
          animationDuration: 500
        };
    }
  }, [layout, linkDist, gravity]);
  React8.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const deg = /* @__PURE__ */ new Map();
    EDGES.forEach(([s, t]) => {
      deg.set(s, (deg.get(s) ?? 0) + 1);
      deg.set(t, (deg.get(t) ?? 0) + 1);
    });
    const t0 = readTokens(host);
    const cy = cytoscape({
      container: host,
      elements: [
        ...NODES.map((n) => ({ data: { ...n, deg: deg.get(n.id) ?? 1, color: t0.c[n.group % t0.c.length] } })),
        ...EDGES.map(([s, t], i) => ({ data: { id: `e${i}`, source: s, target: t } }))
      ],
      style: buildStyle(t0),
      layout: layoutOpts(),
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2
    });
    cyRef.current = cy;
    cy.on("mouseover", "node", (e) => {
      const n = e.target;
      const r = host.getBoundingClientRect();
      const p = n.renderedPosition();
      setTip({ x: p.x, y: p.y, text: `${n.data("label")} \xB7 degree ${n.data("deg")}` });
      void r;
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => prev ? { ...prev, x: p.x, y: p.y } : prev);
    });
    cy.on("mouseout", "node", () => setTip(null));
    cy.on("tap", "node", (e) => {
      const n = e.target;
      const hood = n.closedNeighborhood();
      cy.elements().addClass("faded");
      hood.removeClass("faded").addClass("hl");
      cy.elements().not(hood).removeClass("hl");
    });
    cy.on("tap", (e) => {
      if (e.target === cy) cy.elements().removeClass("faded hl");
    });
    const restyle = () => {
      const el = hostRef.current;
      if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[n.data("group") % tk.c.length])));
      cy.style(buildStyle(tk));
      cy.resize();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    let fitT;
    const fitNow = () => {
      cy.resize();
      cy.fit(void 0, 24);
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(fitT);
      fitT = setTimeout(fitNow, 30);
    });
    ro.observe(host);
    const settle = setTimeout(fitNow, 150);
    return () => {
      clearTimeout(fitT);
      clearTimeout(settle);
      ro.disconnect();
      mo.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, []);
  React8.useEffect(() => {
    const cy = cyRef.current;
    const el = hostRef.current;
    if (!cy || !el) return;
    const tk = readTokens(el);
    cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[n.data("group") % tk.c.length])));
    cy.style(buildStyle(tk));
    cy.resize();
  }, [buildStyle]);
  React8.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        if (n.data("deg") < minDeg) n.addClass("hidden");
        else n.removeClass("hidden");
      });
    });
  }, [minDeg]);
  React8.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const l = cy.layout(layoutOpts());
    l.one("layoutstop", () => cy.fit(void 0, 24));
    l.run();
  }, [layoutOpts]);
  const isForce = layout === "force";
  return /* @__PURE__ */ jsxs11(
    ChartCard,
    {
      title,
      description,
      exportData: NODES.map((n) => ({ id: n.id, label: n.label, group: n.group })),
      children: [
        /* @__PURE__ */ jsxs11(ChartControls, { children: [
          /* @__PURE__ */ jsx17(SegmentedControl, { options: LAYOUTS, value: layout, onChange: setLayout, ariaLabel: "Layout" }),
          /* @__PURE__ */ jsx17(SegmentedControl, { options: EDGE_STYLES, value: edgeStyle, onChange: setEdgeStyle, ariaLabel: "Edges" }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Switch, { id: "nw-deg", checked: sizeByDegree, onCheckedChange: setSizeByDegree }),
            /* @__PURE__ */ jsx17(Label, { htmlFor: "nw-deg", className: "text-xs text-muted-foreground", children: "Size by degree" })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Switch, { id: "nw-lbl", checked: labels, onCheckedChange: setLabels }),
            /* @__PURE__ */ jsx17(Label, { htmlFor: "nw-lbl", className: "text-xs text-muted-foreground", children: "Labels" })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Switch, { id: "nw-arr", checked: arrows, onCheckedChange: setArrows }),
            /* @__PURE__ */ jsx17(Label, { htmlFor: "nw-arr", className: "text-xs text-muted-foreground", children: "Arrows" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs11(ChartControls, { children: [
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Label, { className: "text-xs text-muted-foreground", children: "Gravity" }),
            /* @__PURE__ */ jsx17(Slider, { value: [gravity], onValueChange: ([v]) => setGravity(v), min: 0, max: 100, step: 5, className: "w-28", disabled: !isForce })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Label, { className: "text-xs text-muted-foreground", children: "Link distance" }),
            /* @__PURE__ */ jsx17(Slider, { value: [linkDist], onValueChange: ([v]) => setLinkDist(v), min: 10, max: 140, step: 5, className: "w-28" })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Label, { className: "text-xs text-muted-foreground", children: "Node size" }),
            /* @__PURE__ */ jsx17(Slider, { value: [nodeSize], onValueChange: ([v]) => setNodeSize(v), min: 14, max: 42, step: 2, className: "w-24" })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Label, { className: "text-xs text-muted-foreground", children: "Label size" }),
            /* @__PURE__ */ jsx17(Slider, { value: [labelSize], onValueChange: ([v]) => setLabelSize(v), min: 8, max: 36, step: 1, className: "w-20", disabled: !labels })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx17(Label, { className: "text-xs text-muted-foreground", children: "Min degree" }),
            /* @__PURE__ */ jsx17(Slider, { value: [minDeg], onValueChange: ([v]) => setMinDeg(v), min: 0, max: 6, step: 1, className: "w-20" })
          ] }),
          /* @__PURE__ */ jsx17(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => {
                const cy = cyRef.current;
                if (cy) {
                  cy.elements().removeClass("faded hl");
                  cy.layout(layoutOpts()).run();
                  cy.fit(void 0, 24);
                }
              },
              children: "Fit / reset"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "relative", children: [
          /* @__PURE__ */ jsx17("div", { ref: hostRef, className: "h-[360px] w-full rounded-md border border-border bg-background" }),
          tip && /* @__PURE__ */ jsx17(
            "div",
            {
              className: "pointer-events-none absolute z-10 max-w-[16rem] -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border/50 bg-background px-2 py-1 text-xs shadow-lg",
              style: { left: tip.x, top: tip.y },
              children: tip.text
            }
          )
        ] })
      ]
    }
  );
}

// components/charts/network-layouts.tsx
import * as React9 from "react";
import cytoscape2 from "cytoscape";
import fcose2 from "cytoscape-fcose";
import dagre2 from "cytoscape-dagre";
import avsdf2 from "cytoscape-avsdf";
import { Fragment as Fragment3, jsx as jsx18, jsxs as jsxs12 } from "react/jsx-runtime";
try {
  cytoscape2.use(fcose2);
  cytoscape2.use(dagre2);
  cytoscape2.use(avsdf2);
} catch {
}
var DEG = (() => {
  const d = /* @__PURE__ */ new Map();
  EDGES.forEach(([s, t]) => {
    d.set(s, (d.get(s) ?? 0) + 1);
    d.set(t, (d.get(t) ?? 0) + 1);
  });
  return d;
})();
var byDegreeDesc = (a, b) => b.degree(false) - a.degree(false);
function NetworkGraph({
  title,
  description,
  layout,
  controls,
  defaultEdgeStyle = "curved",
  defaultArrows = false
}) {
  const hostRef = React9.useRef(null);
  const cyRef = React9.useRef(null);
  const layoutRef = React9.useRef(layout);
  layoutRef.current = layout;
  const [labelSize, setLabelSize] = React9.useState(12);
  const [nodeSize, setNodeSize] = React9.useState(26);
  const [sizeByDegree, setSizeByDegree] = React9.useState(true);
  const [labels, setLabels] = React9.useState(true);
  const [minDeg, setMinDeg] = React9.useState(0);
  const [edgeStyle, setEdgeStyle] = React9.useState(defaultEdgeStyle);
  const [arrows, setArrows] = React9.useState(defaultArrows);
  const [tip, setTip] = React9.useState(null);
  const buildStyle = React9.useCallback(
    (t) => [
      {
        selector: "node",
        style: {
          "background-color": "data(color)",
          width: sizeByDegree ? "mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" : nodeSize,
          height: sizeByDegree ? "mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" : nodeSize,
          label: labels ? "data(label)" : "",
          color: t.fg,
          "font-size": `${labelSize}px`,
          "font-family": t.font,
          "min-zoomed-font-size": 4,
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": 4,
          "text-wrap": "ellipsis",
          "text-max-width": "90px",
          "border-width": 1.5,
          "border-color": t.bg
        }
      },
      {
        selector: "edge",
        style: {
          width: 1.4,
          "line-color": t.border,
          "curve-style": edgeStyle === "curved" ? "unbundled-bezier" : "straight",
          "control-point-distances": edgeStyle === "curved" ? 32 : 0,
          "control-point-weights": 0.5,
          "target-arrow-color": t.mutedF,
          "target-arrow-shape": arrows ? "triangle" : "none",
          "arrow-scale": 0.8,
          opacity: 0.85
        }
      },
      { selector: "node.faded", style: { opacity: 0.12 } },
      { selector: "edge.faded", style: { opacity: 0.05 } },
      {
        selector: "node.hl",
        style: { "border-color": t.primary, "border-width": 2.5 }
      },
      { selector: "edge.hl", style: { "line-color": t.primary, width: 2.2, opacity: 1 } },
      { selector: "node.hidden", style: { display: "none" } }
    ],
    [sizeByDegree, nodeSize, labels, labelSize, edgeStyle, arrows]
  );
  React9.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t0 = readTokens(host);
    const cy = cytoscape2({
      container: host,
      elements: [
        ...NODES.map((n) => ({ data: { ...n, deg: DEG.get(n.id) ?? 1, color: t0.c[n.group % t0.c.length] } })),
        ...EDGES.map(([s, t], i) => ({ data: { id: `e${i}`, source: s, target: t } }))
      ],
      style: buildStyle(t0),
      layout: layoutRef.current,
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2
    });
    cyRef.current = cy;
    cy.on("mouseover", "node", (e) => {
      const n = e.target;
      const p = n.renderedPosition();
      setTip({ x: p.x, y: p.y, text: `${n.data("label")} \xB7 degree ${n.data("deg")}` });
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => prev ? { ...prev, x: p.x, y: p.y } : prev);
    });
    cy.on("mouseout", "node", () => setTip(null));
    cy.on("tap", "node", (e) => {
      const n = e.target;
      const hood = n.closedNeighborhood();
      cy.elements().addClass("faded");
      hood.removeClass("faded").addClass("hl");
      cy.elements().not(hood).removeClass("hl");
    });
    cy.on("tap", (e) => {
      if (e.target === cy) cy.elements().removeClass("faded hl");
    });
    const restyle = () => {
      const el = hostRef.current;
      if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[n.data("group") % tk.c.length])));
      cy.style(buildStyle(tk));
      cy.resize();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    let fitT;
    const fitNow = () => {
      cy.resize();
      cy.fit(void 0, 24);
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(fitT);
      fitT = setTimeout(fitNow, 30);
    });
    ro.observe(host);
    const settle = setTimeout(fitNow, 150);
    return () => {
      clearTimeout(fitT);
      clearTimeout(settle);
      ro.disconnect();
      mo.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, []);
  React9.useEffect(() => {
    const cy = cyRef.current;
    const el = hostRef.current;
    if (!cy || !el) return;
    const tk = readTokens(el);
    cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[n.data("group") % tk.c.length])));
    cy.style(buildStyle(tk));
    cy.resize();
  }, [buildStyle]);
  React9.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        if (n.data("deg") < minDeg) n.addClass("hidden");
        else n.removeClass("hidden");
      });
    });
  }, [minDeg]);
  React9.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const l = cy.layout(layout);
    l.one("layoutstop", () => cy.fit(void 0, 24));
    l.run();
  }, [layout]);
  return /* @__PURE__ */ jsxs12(
    ChartCard,
    {
      title,
      description,
      exportData: NODES.map((n) => ({ id: n.id, label: n.label, group: n.group })),
      children: [
        controls,
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(
            SegmentedControl,
            {
              options: EDGE_STYLES,
              value: edgeStyle,
              onChange: setEdgeStyle,
              ariaLabel: "Edge style",
              labels: { straight: "Straight", curved: "Curved" }
            }
          ),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Switch, { id: `${title}-deg`, checked: sizeByDegree, onCheckedChange: setSizeByDegree }),
            /* @__PURE__ */ jsx18(Label, { htmlFor: `${title}-deg`, className: "text-xs text-muted-foreground", children: "Size by degree" })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Switch, { id: `${title}-lbl`, checked: labels, onCheckedChange: setLabels }),
            /* @__PURE__ */ jsx18(Label, { htmlFor: `${title}-lbl`, className: "text-xs text-muted-foreground", children: "Labels" })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Switch, { id: `${title}-arr`, checked: arrows, onCheckedChange: setArrows }),
            /* @__PURE__ */ jsx18(Label, { htmlFor: `${title}-arr`, className: "text-xs text-muted-foreground", children: "Arrows" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Node size" }),
            /* @__PURE__ */ jsx18(Slider, { value: [nodeSize], onValueChange: ([v]) => setNodeSize(v), min: 14, max: 42, step: 2, className: "w-24" })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Label size" }),
            /* @__PURE__ */ jsx18(Slider, { value: [labelSize], onValueChange: ([v]) => setLabelSize(v), min: 8, max: 36, step: 1, className: "w-20", disabled: !labels })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Min degree" }),
            /* @__PURE__ */ jsx18(Slider, { value: [minDeg], onValueChange: ([v]) => setMinDeg(v), min: 0, max: 6, step: 1, className: "w-20" })
          ] }),
          /* @__PURE__ */ jsx18(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => {
                const cy = cyRef.current;
                if (cy) {
                  cy.elements().removeClass("faded hl");
                  cy.layout(layout).run();
                  cy.fit(void 0, 24);
                }
              },
              children: "Fit / reset"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs12("div", { className: "relative", children: [
          /* @__PURE__ */ jsx18("div", { ref: hostRef, className: "h-[360px] w-full rounded-md border border-border bg-background" }),
          tip && /* @__PURE__ */ jsx18(
            "div",
            {
              className: "pointer-events-none absolute z-10 max-w-[16rem] -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border/50 bg-background px-2 py-1 text-xs shadow-lg",
              style: { left: tip.x, top: tip.y },
              children: tip.text
            }
          )
        ] })
      ]
    }
  );
}
function Knob({ label, value, min, max, step, onChange }) {
  return /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx18(Slider, { value: [value], onValueChange: ([v]) => onChange(v), min, max, step, className: "w-24" }),
    /* @__PURE__ */ jsx18("span", { className: "w-7 text-right text-[11px] tabular-nums text-muted-foreground", children: value })
  ] });
}
function Toggle({ id, label, checked, onChange }) {
  return /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx18(Switch, { id, checked, onCheckedChange: onChange }),
    /* @__PURE__ */ jsx18(Label, { htmlFor: id, className: "text-xs text-muted-foreground", children: label })
  ] });
}
function ChartNetworkForce() {
  const [repulsion, setRepulsion] = React9.useState(4500);
  const [edgeLen, setEdgeLen] = React9.useState(50);
  const [gravity, setGravity] = React9.useState(25);
  const [nodeSep, setNodeSep] = React9.useState(75);
  const [quality, setQuality] = React9.useState("default");
  const layout = React9.useMemo(
    () => ({
      name: "fcose",
      quality,
      animate: false,
      randomize: true,
      packComponents: true,
      numIter: 2500,
      nodeRepulsion: () => repulsion,
      idealEdgeLength: () => edgeLen,
      gravity: gravity / 100,
      nodeSeparation: nodeSep
    }),
    [quality, repulsion, edgeLen, gravity, nodeSep]
  );
  return /* @__PURE__ */ jsx18(
    NetworkGraph,
    {
      title: "Force-directed network",
      description: "fCoSE spring embedder \u2014 clusters and hubs emerge from node repulsion balanced against edge springs. The best first look at an unfamiliar graph.",
      layout,
      controls: /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsx18(ChartControls, { children: /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Quality" }),
          /* @__PURE__ */ jsx18(
            SegmentedControl,
            {
              options: ["draft", "default", "proof"],
              value: quality,
              onChange: setQuality,
              ariaLabel: "Quality",
              labels: { draft: "Draft", default: "Default", proof: "Proof" }
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Knob, { label: "Node repulsion", value: repulsion, min: 500, max: 2e4, step: 500, onChange: setRepulsion }),
          /* @__PURE__ */ jsx18(Knob, { label: "Ideal edge length", value: edgeLen, min: 10, max: 200, step: 5, onChange: setEdgeLen }),
          /* @__PURE__ */ jsx18(Knob, { label: "Gravity", value: gravity, min: 0, max: 100, step: 5, onChange: setGravity }),
          /* @__PURE__ */ jsx18(Knob, { label: "Node separation", value: nodeSep, min: 20, max: 160, step: 5, onChange: setNodeSep })
        ] })
      ] })
    }
  );
}
var RANKERS = ["network-simplex", "tight-tree", "longest-path"];
var DIRS = ["TB", "LR", "BT", "RL"];
function ChartNetworkHierarchy() {
  const [dir, setDir] = React9.useState("TB");
  const [ranker, setRanker] = React9.useState("network-simplex");
  const [nodeSep, setNodeSep] = React9.useState(40);
  const [rankSep, setRankSep] = React9.useState(60);
  const [edgeSep, setEdgeSep] = React9.useState(10);
  const layout = React9.useMemo(
    () => ({
      name: "dagre",
      rankDir: dir,
      ranker,
      nodeSep,
      rankSep,
      edgeSep,
      animate: false
    }),
    [dir, ranker, nodeSep, rankSep, edgeSep]
  );
  return /* @__PURE__ */ jsx18(
    NetworkGraph,
    {
      title: "Hierarchical network",
      description: "Dagre layered (Sugiyama) layout \u2014 nodes ranked into levels flowing one way. Best for DAGs, trees and dependency or process flows.",
      layout,
      defaultArrows: true,
      defaultEdgeStyle: "straight",
      controls: /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Direction" }),
            /* @__PURE__ */ jsx18(
              SegmentedControl,
              {
                options: DIRS,
                value: dir,
                onChange: setDir,
                ariaLabel: "Direction",
                labels: { TB: "Top\u2193", LR: "Left\u2192", BT: "Bottom\u2191", RL: "Right\u2190" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx18(Label, { className: "text-xs text-muted-foreground", children: "Ranker" }),
            /* @__PURE__ */ jsx18(
              SegmentedControl,
              {
                options: RANKERS,
                value: ranker,
                onChange: setRanker,
                ariaLabel: "Ranker",
                labels: { "network-simplex": "Balanced", "tight-tree": "Tight", "longest-path": "Longest" }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Knob, { label: "Node sep", value: nodeSep, min: 10, max: 120, step: 5, onChange: setNodeSep }),
          /* @__PURE__ */ jsx18(Knob, { label: "Rank sep", value: rankSep, min: 20, max: 180, step: 5, onChange: setRankSep }),
          /* @__PURE__ */ jsx18(Knob, { label: "Edge sep", value: edgeSep, min: 0, max: 40, step: 2, onChange: setEdgeSep })
        ] })
      ] })
    }
  );
}
function ChartNetworkCircle() {
  const [startAngle, setStartAngle] = React9.useState(270);
  const [sweep, setSweep] = React9.useState(360);
  const [spacing, setSpacing] = React9.useState(100);
  const [clockwise, setClockwise] = React9.useState(true);
  const [byDegree, setByDegree] = React9.useState(true);
  const layout = React9.useMemo(
    () => ({
      name: "circle",
      animate: false,
      clockwise,
      startAngle: startAngle * Math.PI / 180,
      sweep: sweep * Math.PI / 180,
      spacingFactor: spacing / 100,
      avoidOverlap: true,
      sort: byDegree ? byDegreeDesc : void 0
    }),
    [clockwise, startAngle, sweep, spacing, byDegree]
  );
  return /* @__PURE__ */ jsx18(
    NetworkGraph,
    {
      title: "Circle network",
      description: "Every node on a single ring. Order carries the meaning \u2014 sort by degree to group hubs together; a sweep under 360\xB0 draws an arc.",
      layout,
      controls: /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Toggle, { id: "circle-cw", label: "Clockwise", checked: clockwise, onChange: setClockwise }),
          /* @__PURE__ */ jsx18(Toggle, { id: "circle-deg", label: "Sort by degree", checked: byDegree, onChange: setByDegree })
        ] }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Knob, { label: "Start angle", value: startAngle, min: 0, max: 360, step: 15, onChange: setStartAngle }),
          /* @__PURE__ */ jsx18(Knob, { label: "Sweep", value: sweep, min: 90, max: 360, step: 15, onChange: setSweep }),
          /* @__PURE__ */ jsx18(Knob, { label: "Spacing", value: spacing, min: 50, max: 220, step: 10, onChange: setSpacing })
        ] })
      ] })
    }
  );
}
function ChartNetworkConcentric() {
  const [minSpacing, setMinSpacing] = React9.useState(10);
  const [levelWidth, setLevelWidth] = React9.useState(1);
  const [spacing, setSpacing] = React9.useState(100);
  const [startAngle, setStartAngle] = React9.useState(270);
  const [equidistant, setEquidistant] = React9.useState(false);
  const layout = React9.useMemo(
    () => ({
      name: "concentric",
      animate: false,
      clockwise: true,
      concentric: (n) => n.degree(false),
      levelWidth: () => levelWidth,
      minNodeSpacing: minSpacing,
      spacingFactor: spacing / 100,
      equidistant,
      startAngle: startAngle * Math.PI / 180
    }),
    [minSpacing, levelWidth, spacing, startAngle, equidistant]
  );
  return /* @__PURE__ */ jsx18(
    NetworkGraph,
    {
      title: "Concentric network",
      description: "Rings by importance \u2014 the highest-degree nodes sit in the centre and importance descends outward. Reveals hub-and-periphery structure at a glance.",
      layout,
      controls: /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsx18(ChartControls, { children: /* @__PURE__ */ jsx18(Toggle, { id: "conc-eq", label: "Equidistant rings", checked: equidistant, onChange: setEquidistant }) }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Knob, { label: "Min spacing", value: minSpacing, min: 4, max: 40, step: 2, onChange: setMinSpacing }),
          /* @__PURE__ */ jsx18(Knob, { label: "Ring grouping", value: levelWidth, min: 1, max: 4, step: 1, onChange: setLevelWidth }),
          /* @__PURE__ */ jsx18(Knob, { label: "Spacing", value: spacing, min: 50, max: 220, step: 10, onChange: setSpacing }),
          /* @__PURE__ */ jsx18(Knob, { label: "Start angle", value: startAngle, min: 0, max: 360, step: 15, onChange: setStartAngle })
        ] })
      ] })
    }
  );
}
function ChartNetworkGrid() {
  const [cols, setCols] = React9.useState(0);
  const [rows, setRows] = React9.useState(0);
  const [spacing, setSpacing] = React9.useState(100);
  const [avoidOverlap, setAvoidOverlap] = React9.useState(true);
  const [condense, setCondense] = React9.useState(false);
  const [byDegree, setByDegree] = React9.useState(false);
  const layout = React9.useMemo(
    () => ({
      name: "grid",
      animate: false,
      avoidOverlap,
      condense,
      spacingFactor: spacing / 100,
      rows: rows || void 0,
      cols: cols || void 0,
      sort: byDegree ? byDegreeDesc : void 0
    }),
    [avoidOverlap, condense, spacing, rows, cols, byDegree]
  );
  return /* @__PURE__ */ jsx18(
    NetworkGraph,
    {
      title: "Grid network",
      description: "Nodes snapped to a tidy lattice \u2014 predictable left-to-right scanning, good for small sets or matrix-like reading. Rows / columns at 0 auto-fit.",
      layout,
      controls: /* @__PURE__ */ jsxs12(Fragment3, { children: [
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Toggle, { id: "grid-ov", label: "Avoid overlap", checked: avoidOverlap, onChange: setAvoidOverlap }),
          /* @__PURE__ */ jsx18(Toggle, { id: "grid-cd", label: "Condense", checked: condense, onChange: setCondense }),
          /* @__PURE__ */ jsx18(Toggle, { id: "grid-deg", label: "Sort by degree", checked: byDegree, onChange: setByDegree })
        ] }),
        /* @__PURE__ */ jsxs12(ChartControls, { children: [
          /* @__PURE__ */ jsx18(Knob, { label: "Columns", value: cols, min: 0, max: 8, step: 1, onChange: setCols }),
          /* @__PURE__ */ jsx18(Knob, { label: "Rows", value: rows, min: 0, max: 8, step: 1, onChange: setRows }),
          /* @__PURE__ */ jsx18(Knob, { label: "Spacing", value: spacing, min: 50, max: 220, step: 10, onChange: setSpacing })
        ] })
      ] })
    }
  );
}
export {
  ChartArea,
  ChartBar,
  ChartBeeswarm,
  ChartBoxPlot,
  ChartBrush,
  ChartBullet,
  ChartCandlestick,
  ChartCard,
  ChartControls,
  ChartDonut,
  ChartDualAxis,
  ChartDumbbell,
  ChartEmpty,
  ChartError,
  ChartFunnel,
  ChartGauge,
  ChartHeatmap,
  ChartHistogram,
  ChartLine,
  ChartNetwork,
  ChartNetworkCircle,
  ChartNetworkConcentric,
  ChartNetworkForce,
  ChartNetworkGrid,
  ChartNetworkHierarchy,
  ChartRadar,
  ChartSankey,
  ChartScatter,
  ChartSkeleton,
  ChartSparkline,
  ChartStreamgraph,
  ChartSunburst,
  ChartTreemap,
  ChartViolin,
  ChartWaffle,
  ChartWaterfall,
  exportCsv,
  exportPng,
  exportSvg
};
