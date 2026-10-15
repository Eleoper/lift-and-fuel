import type { Day, Lift, Profile, Suggestion, LastTimeResult } from "../types"
import { LB, PROGRAM } from "../constants"
import { shift, sortedKeys, U, fmt, w1 } from "./helpers"

/** Epley estimated 1-rep max */
export function e1rm(kg: number, reps: number): number {
  return reps <= 1 ? kg : kg * (1 + reps / 30)
}

/**
 * U.S. Navy circumference method (men), all inputs in cm.
 * Typically within about ±3–4 percentage points of DEXA.
 */
export function navyBf(
  waistCm: number,
  neckCm: number,
  heightCm: number,
): number | null {
  const dlt = waistCm - neckCm
  if (!(dlt > 0) || !heightCm) return null
  const v =
    495 /
      (1.0324 -
        0.19077 * Math.log10(dlt) +
        0.15456 * Math.log10(heightCm)) -
    450
  return isFinite(v) ? Math.round(v * 10) / 10 : null
}

export function latestBf(
  days: Record<string, Partial<Day>>,
  profile: Profile,
): number {
  const k = sortedKeys(days)
    .reverse()
    .find((k) => days[k]?.bf != null)
  return k ? (days[k]!.bf as number) : (profile.startBf ?? 29)
}

export function latestOf(
  days: Record<string, Partial<Day>>,
  field: keyof Day,
): unknown {
  const k = sortedKeys(days)
    .reverse()
    .find((k) => (days[k] as Record<string, unknown>)?.[field] != null)
  return k ? (days[k] as Record<string, unknown>)?.[field] : null
}

export function latestWeight(
  days: Record<string, Partial<Day>>,
): number | null {
  const k = sortedKeys(days)
    .reverse()
    .find((k) => days[k]?.weight != null)
  return k ? (days[k]!.weight as number) : null
}

export function avgWeight(
  days: Record<string, Partial<Day>>,
  k: string,
): number | null {
  const vals: number[] = []
  for (let i = 0; i < 7; i++) {
    const d = days[shift(k, -i)]
    if (d?.weight != null) vals.push(d.weight as number)
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export function lastTime(
  days: Record<string, Partial<Day>>,
  name: string,
  before: string,
): LastTimeResult | null {
  const nm = name.toLowerCase()
  for (const k of sortedKeys(days).reverse()) {
    if (k >= before) continue
    const ex = ((days[k]?.lifts as Lift[]) || []).find(
      (x) => x.name.toLowerCase() === nm && x.sets.length,
    )
    if (ex) return { date: k, ex }
  }
  return null
}

export function progEx(name: string) {
  const nm = name.trim().toLowerCase()
  for (const k of ["push", "pull", "legs"] as const) {
    const prog = PROGRAM[k]
    if (prog.kind === "lift") {
      const e = prog.ex.find((x) => x.n.toLowerCase() === nm)
      if (e) return e
    }
  }
  return null
}

export function suggest(
  e: { n: string; sets: number; hi: number; inc: number },
  days: Record<string, Partial<Day>>,
  date: string,
  profile: Profile,
): Suggestion {
  const lt = lastTime(days, e.n, date)
  if (!lt)
    return {
      kg: null,
      up: false,
      txt: "First time: pick a weight you could lift for 2 more reps.",
    }
  const sets = lt.ex.sets
  const top = sets.reduce((a, s) => (s.kg > a.kg ? s : a), sets[0]!)
  const atTop = sets.length >= e.sets && sets.every((s) => s.reps >= e.hi)
  const inc = U(profile) === "lb" ? e.inc * LB : e.inc * 0.5
  if (atTop && top.kg > 0)
    return {
      kg: top.kg + inc,
      up: true,
      txt: `Hit ${e.hi}+ on every set last time. Go up to ${fmt(w1(top.kg + inc, profile), 1)} ${U(profile)}.`,
    }
  return {
    kg: top.kg || null,
    up: false,
    txt: `Last: ${top.kg ? w1(top.kg, profile) + " " + U(profile) + " × " : ""}${sets.map((s) => s.reps).join(", ")}. ${top.kg ? "Same weight, add reps." : "Add reps."}`,
  }
}
