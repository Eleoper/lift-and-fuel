import type { Avatar, Day, Food, Profile, Totals, WeightUnit } from "../types"
import { LB, CM_IN, DEFAULT_AVATAR } from "../constants"

export function pad(v: number): string {
  return String(v).padStart(2, "0")
}

export function keyOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function dateOf(k: string): Date {
  const [y, m, d] = k.split("-").map(Number)
  return new Date(y!, m! - 1, d)
}

export function shift(k: string, v: number): string {
  const d = dateOf(k)
  d.setDate(d.getDate() + v)
  return keyOf(d)
}

export function esc(s: unknown): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  )
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function n(v: unknown): number {
  const x = parseFloat(String(v))
  return isFinite(x) ? x : 0
}

export function fmt(v: number, d = 0): string {
  return Number(v).toLocaleString(undefined, {
    maximumFractionDigits: d,
    minimumFractionDigits: 0,
  })
}

export function U(profile: Profile): WeightUnit {
  return profile.unit === "kg" ? "kg" : "lb"
}

export function LU(profile: Profile): "cm" | "in" {
  return profile.unit === "kg" ? "cm" : "in"
}

export function DU(profile: Profile): "km" | "mi" {
  return profile.unit === "kg" ? "km" : "mi"
}

export function toKm(v: number, profile: Profile): number {
  return DU(profile) === "mi" ? v * 1.609344 : v
}

export function fromKm(km: number, profile: Profile): number {
  return DU(profile) === "mi" ? km / 1.609344 : km
}

export function paceStr(min: number, km: number, profile: Profile): string {
  if (!km || !min) return "–"
  const p = min / fromKm(km, profile)
  const m = Math.floor(p)
  const sec = Math.round((p - m) * 60)
  return `${sec === 60 ? m + 1 : m}:${pad(sec === 60 ? 0 : sec)}`
}

export function toKg(v: number, profile: Profile): number {
  return U(profile) === "lb" ? v * LB : v
}

export function fromKg(kg: number, profile: Profile): number {
  return U(profile) === "lb" ? kg / LB : kg
}

export function toCm(v: number, profile: Profile): number {
  return LU(profile) === "in" ? v * CM_IN : v
}

export function fromCm(cm: number, profile: Profile): number {
  return LU(profile) === "in" ? cm / CM_IN : cm
}

export function w1(kg: number, profile: Profile): number {
  return Math.round(fromKg(kg, profile) * 10) / 10
}

export function shortDate(k: string): string {
  return dateOf(k).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function todayKey(): string {
  return keyOf(new Date())
}

export function getDay(days: Record<string, Partial<Day>>, k: string): Day {
  const d = days[k] ?? {}
  return {
    date: k,
    foods: (d.foods as Food[]) ?? [],
    lifts: d.lifts ?? [],
    runs: d.runs ?? [],
    weight: d.weight ?? null,
    supps: d.supps ?? {},
    water: d.water ?? 0,
    sleep: d.sleep ?? null,
    steps: d.steps ?? null,
    rest: d.rest ?? null,
    session: d.session ?? null,
    mob: !!d.mob,
    waist: d.waist ?? null,
    neck: d.neck ?? null,
    bf: d.bf ?? null,
    bfSrc: d.bfSrc ?? null,
    photo: !!d.photo,
  }
}

export function totals(d: Day): Totals {
  const t = { kcal: 0, p: 0, c: 0, f: 0 }
  for (const x of d.foods) {
    const q = x.qty || 1
    t.kcal += x.kcal * q
    t.p += x.p * q
    t.c += x.c * q
    t.f += x.f * q
  }
  return t
}

export function sortedKeys(days: Record<string, unknown>): string[] {
  return Object.keys(days).sort()
}

export function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]!
}

export function avatar(profile: Profile): Avatar {
  return { ...DEFAULT_AVATAR, ...(profile.avatar ?? {}) }
}

export function weekOf(k: string): string {
  const d = dateOf(k)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  return keyOf(d)
}
