import { NextResponse } from "next/server";
import type { SensorReading } from "@/lib/types";

const parseNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === "string" ? Number(value) : Number(value ?? fallback);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeReading = (raw: Record<string, unknown>): SensorReading => {
  return {
    timestamp:
      (typeof raw.timestamp === "string" && raw.timestamp) ||
      new Date().toISOString(),
    temperature: parseNumber(raw.temperature ?? raw.temp),
    humidity: parseNumber(raw.humidity),
    rain: parseNumber(raw.rain),
    light: parseNumber(raw.light ?? raw.lux),
    pressure: parseNumber(raw.pressure ?? raw.pres),
  };
};

export async function GET() {
  const endpoint = process.env.ARDUINO_API_URL ?? process.env.NEXT_PUBLIC_ARDUINO_API_URL;

  if (!endpoint) {
    return NextResponse.json(
      {
        error:
          "Missing ARDUINO_API_URL. Add it to .env.local to read local Arduino sensor data.",
      },
      { status: 500 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Arduino endpoint failed with status ${response.status}.`,
        },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as unknown;
    const firstItem = Array.isArray(payload)
      ? (payload.at(-1) as Record<string, unknown> | undefined)
      : undefined;

    const source = (firstItem ?? payload) as Record<string, unknown>;

    if (!source || typeof source !== "object") {
      return NextResponse.json(
        { error: "Arduino response format is invalid." },
        { status: 502 },
      );
    }

    return NextResponse.json(normalizeReading(source));
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to reach Arduino API. Ensure your local endpoint is running and reachable.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

