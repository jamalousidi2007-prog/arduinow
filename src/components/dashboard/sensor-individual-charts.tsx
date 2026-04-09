"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorKey, SensorReading } from "@/lib/types";

interface SensorIndividualChartsProps {
  data: Array<SensorReading & { index: number }>;
  labels: Record<SensorKey, string>;
  units: Record<SensorKey, string>;
}

interface SensorStyle {
  key: SensorKey;
  stroke: string;
  fill: string;
}

const sensorStyles: SensorStyle[] = [
  {
    key: "temperature",
    stroke: "#f97316",
    fill: "url(#gradient-temperature)",
  },
  {
    key: "humidity",
    stroke: "#0ea5e9",
    fill: "url(#gradient-humidity)",
  },
  {
    key: "rain",
    stroke: "#4f46e5",
    fill: "url(#gradient-rain)",
  },
  {
    key: "light",
    stroke: "#eab308",
    fill: "url(#gradient-light)",
  },
  {
    key: "pressure",
    stroke: "#10b981",
    fill: "url(#gradient-pressure)",
  },
];

export function SensorIndividualCharts({
  data,
  labels,
  units,
}: SensorIndividualChartsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sensorStyles.map((sensor) => (
        <article
          key={sensor.key}
          className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="mb-3 flex items-end justify-between">
            <h4 className="text-sm font-bold uppercase tracking-[0.08em] text-white">
              {labels[sensor.key]}
            </h4>
            <p className="text-xs text-slate-300">{units[sensor.key]}</p>
          </div>

          <div className="h-44 w-full rounded-xl border border-white/20 bg-slate-950/45 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id={`gradient-${sensor.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={sensor.stroke}
                      stopOpacity={0.55}
                    />
                    <stop
                      offset="100%"
                      stopColor={sensor.stroke}
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="index"
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <YAxis
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                  width={45}
                />
                <Tooltip
                  formatter={(value) => {
                    const raw =
                      typeof value === "number"
                        ? value
                        : Number(value ?? Number.NaN);
                    const text = Number.isFinite(raw)
                      ? `${raw.toFixed(2)} ${units[sensor.key]}`
                      : `-- ${units[sensor.key]}`;
                    return [text, labels[sensor.key]];
                  }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid #334155",
                    backgroundColor: "#020617",
                    color: "#e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={sensor.key}
                  stroke={sensor.stroke}
                  fill={sensor.fill}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      ))}
    </section>
  );
}
