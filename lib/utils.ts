import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a numeric value without inventing zero for missing data.
 * Empty strings, booleans, null, undefined, NaN and infinities are rejected.
 */
export function numeric(value: unknown): number | null {
  if (value === null || value === undefined) return null

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}
