"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorReading } from "@/lib/types";

interface SensorChartProps {
  data: Array<SensorReading & { index: number }>;
  labels: {
    temperature: string;
    humidity: string;
    rain: string;
    light: string;
    pressure: string;
  };
}

export function SensorChart({ data, labels }: SensorChartProps) {
  return (
    <div className="h-[340px] w-full rounded-2xl border border-white/50 bg-white/65 p-4 shadow-xl backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis
            dataKey="index"
            tick={{ fill: "#334155", fontSize: 12 }}
            axisLine={{ stroke: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
          />
          <YAxis
            tick={{ fill: "#334155", fontSize: 12 }}
            axisLine={{ stroke: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            name={labels.temperature}
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            name={labels.humidity}
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="rain"
            name={labels.rain}
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="light"
            name={labels.light}
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pressure"
            name={labels.pressure}
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

