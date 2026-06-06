"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta: Meta = {
  title: "Patterns/Maps",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Geospatial idioms: a choropleth (single token hue, intensity = opacity) and a proportional-symbol dot map, both on the Natural Earth projection from the world-atlas TopoJSON. All colour comes from the design tokens.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Geometry (computed once at module load, browser only)
// ---------------------------------------------------------------------------
const W = 440;
const H = 230;

type AnyFeature = { id?: string | number; geometry: unknown; properties?: { name?: string } };

const topo = worldData as unknown as { objects: { countries: unknown } };
const countries = (
  feature(topo as never, topo.objects.countries as never) as unknown as {
    features: AnyFeature[];
  }
).features.filter((f) => String(f.id) !== "010"); // drop Antarctica for a tighter frame

const projection = geoNaturalEarth1().fitSize(
  [W, H],
  { type: "FeatureCollection", features: countries } as never
);
const path = geoPath(projection as never);
const graticule = path(geoGraticule10() as never) ?? "";

// Deterministic per-country "value" from the numeric id
const valueOf = (id: string | number | undefined) => {
  const n = Number(id ?? 0);
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const CITIES: { name: string; lon: number; lat: number; pop: number }[] = [
  { name: "Tokyo", lon: 139.7, lat: 35.7, pop: 37 },
  { name: "Delhi", lon: 77.2, lat: 28.6, pop: 33 },
  { name: "Shanghai", lon: 121.5, lat: 31.2, pop: 29 },
  { name: "São Paulo", lon: -46.6, lat: -23.5, pop: 22 },
  { name: "Mexico City", lon: -99.1, lat: 19.4, pop: 22 },
  { name: "Cairo", lon: 31.2, lat: 30.0, pop: 21 },
  { name: "New York", lon: -74.0, lat: 40.7, pop: 19 },
  { name: "Lagos", lon: 3.4, lat: 6.5, pop: 15 },
  { name: "Los Angeles", lon: -118.2, lat: 34.1, pop: 13 },
  { name: "Moscow", lon: 37.6, lat: 55.8, pop: 12 },
  { name: "Paris", lon: 2.35, lat: 48.9, pop: 11 },
  { name: "London", lon: -0.1, lat: 51.5, pop: 9 },
  { name: "Sydney", lon: 151.2, lat: -33.9, pop: 5 },
];

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Choropleth
// ---------------------------------------------------------------------------
function Choropleth() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <path d={graticule} fill="none" stroke="var(--border)" strokeWidth={0.4} opacity={0.5} />
      {countries.map((f, i) => {
        const v = valueOf(f.id);
        return (
          <path
            key={`${f.id}-${i}`}
            d={path(f as never) ?? ""}
            fill="var(--chart-1)"
            opacity={0.12 + v * 0.8}
            stroke="var(--background)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Proportional-symbol dot map
// ---------------------------------------------------------------------------
function DotMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <path d={graticule} fill="none" stroke="var(--border)" strokeWidth={0.4} opacity={0.5} />
      {countries.map((f, i) => (
        <path
          key={`${f.id}-${i}`}
          d={path(f as never) ?? ""}
          fill="var(--muted)"
          opacity={0.8}
          stroke="var(--background)"
          strokeWidth={0.5}
        />
      ))}
      {CITIES.map((c) => {
        const p = (projection as (c: [number, number]) => [number, number] | null)([c.lon, c.lat]);
        if (!p) return null;
        const r = Math.sqrt(c.pop) * 1.5;
        return (
          <g key={c.name}>
            <circle cx={p[0]} cy={p[1]} r={r} fill="var(--chart-1)" opacity={0.7} stroke="var(--background)" strokeWidth={0.8} />
            {c.pop >= 20 && (
              <text
                x={p[0]}
                y={p[1] - r - 2}
                textAnchor="middle"
                fontSize={6.5}
                fontFamily="monospace"
                fill="var(--muted-foreground)"
              >
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const MapGallery: Story = {
  name: "Map Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maps</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Geospatial idioms on the Natural Earth projection. The choropleth ramps one
            token hue by opacity; symbols scale with the square root of value so area is honest.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <ChartCard title="Choropleth" description="Per-country intensity — single hue, opacity ramp.">
            <Choropleth />
          </ChartCard>
          <ChartCard title="Dot map" description="Proportional symbols for the largest metro areas.">
            <DotMap />
          </ChartCard>
        </div>
      </div>
    </div>
  ),
};
