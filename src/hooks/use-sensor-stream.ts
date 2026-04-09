"use client";

import { useEffect, useMemo, useState } from "react";
import type { SensorReading, SensorKey } from "@/lib/types";

const POLL_MS = 5000;
const MAX_POINTS = 120;

interface SensorStats {
  average: number;
  min: number;
  max: number;
}

const isErrorPayload = (value: unknown): value is { error: string } => {
  if (!value || typeof value !== "object") return false;
  return (
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
};

const isSensorReading = (value: unknown): value is SensorReading => {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<SensorReading>;
  return (
    typeof row.timestamp === "string" &&
    typeof row.temperature === "number" &&
    typeof row.humidity === "number" &&
    typeof row.rain === "number" &&
    typeof row.light === "number" &&
    typeof row.pressure === "number"
  );
};

export function useSensorStream() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const pull = async () => {
      try {
        const response = await fetch("/api/sensors", { cache: "no-store" });
        const payload = (await response.json()) as unknown;

        if (!response.ok || isErrorPayload(payload)) {
          throw new Error(
            isErrorPayload(payload) ? payload.error : "Unable to load sensors.",
          );
        }

        if (!isSensorReading(payload)) {
          throw new Error("Sensor payload format is invalid.");
        }

        if (!active) return;

        setReadings((prev) => {
          const next = [...prev, payload];
          return next.slice(Math.max(0, next.length - MAX_POINTS));
        });
        setLastUpdated(payload.timestamp);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Sensor polling failed.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void pull();
    const interval = window.setInterval(() => {
      void pull();
    }, POLL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const latest = readings.at(-1) ?? null;

  const getStats = (key: SensorKey): SensorStats | null => {
    if (readings.length === 0) return null;

    const values = readings.map((item) => item[key]);
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      average: total / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const chartData = useMemo(
    () =>
      readings.map((item, idx) => ({
        index: idx + 1,
        ...item,
      })),
    [readings],
  );

  return {
    readings,
    chartData,
    latest,
    loading,
    error,
    lastUpdated,
    getStats,
  };
}

