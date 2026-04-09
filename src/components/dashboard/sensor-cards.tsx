"use client";

import {
  CloudRain,
  Droplets,
  Gauge,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { SensorReading } from "@/lib/types";

interface SensorCardsProps {
  latest: SensorReading | null;
  labels: {
    temperature: string;
    humidity: string;
    rain: string;
    light: string;
    pressure: string;
  };
}

interface SensorMeta {
  key: keyof Omit<SensorReading, "timestamp">;
  unit: string;
  icon: LucideIcon;
  color: string;
}

const sensorMeta: SensorMeta[] = [
  {
    key: "temperature",
    unit: "C",
    icon: Thermometer,
    color: "from-orange-500/25 to-rose-500/25",
  },
  {
    key: "humidity",
    unit: "%",
    icon: Droplets,
    color: "from-cyan-500/25 to-blue-500/25",
  },
  {
    key: "rain",
    unit: "%",
    icon: CloudRain,
    color: "from-sky-500/25 to-indigo-500/25",
  },
  {
    key: "light",
    unit: "lx",
    icon: Sun,
    color: "from-amber-500/25 to-yellow-500/25",
  },
  {
    key: "pressure",
    unit: "hPa",
    icon: Gauge,
    color: "from-emerald-500/25 to-teal-500/25",
  },
];

export function SensorCards({ latest, labels }: SensorCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {sensorMeta.map((sensor) => {
        const Icon = sensor.icon;
        const value = latest?.[sensor.key];

        return (
          <article
            key={sensor.key}
            className={`rounded-2xl border border-white/35 bg-gradient-to-br ${sensor.color} p-4 shadow-xl backdrop-blur-sm`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                {labels[sensor.key]}
              </p>
              <Icon className="h-4 w-4 text-slate-700" />
            </div>
            <p className="text-3xl font-black text-slate-950">
              {typeof value === "number" ? value.toFixed(1) : "--"}
              <span className="ml-1 text-lg font-medium text-slate-700">
                {sensor.unit}
              </span>
            </p>
          </article>
        );
      })}
    </div>
  );
}

