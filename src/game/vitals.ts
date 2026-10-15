import type { Day, Mood, Profile, Vitals } from "../types"
import { getDay, todayKey, totals } from "./helpers"
import { quests } from "./quests"
import { targets } from "./targets"

export const MOOD_LABEL: Record<Mood, string> = {
  late: "Sleepy",
  sleepy: "Tired",
  hungry: "Hungry",
  thirsty: "Thirsty",
  ecstatic: "Ecstatic",
  happy: "Happy",
  pumped: "Pumped",
  content: "Ready",
}

export function vitals(
  days: Record<string, Partial<Day>>,
  profile: Profile,
): Vitals {
  const k = todayKey()
  const d = getDay(days, k)
  const T = targets(d, profile)
  const t = totals(d)
  const now = new Date()
  const h = now.getHours() + now.getMinutes() / 60

  const exp = Math.min(1, Math.max(0.15, (h - 7) / 14))
  const fuel = T.protein ? Math.min(1, t.p / T.protein / exp) : 0
  const hyd = profile.waterGoal ? Math.min(1, d.water / profile.waterGoal / exp) : 0
  let energy = d.sleep == null ? 0.7 : Math.min(1, d.sleep / (profile.sleepGoal || 7))
  if (h >= 23 || h < 5) energy = Math.min(energy, 0.3)

  const r = quests(d, profile)
  let mood: Mood = "content"
  if (h >= 23 || h < 5) mood = "late"
  else if (energy < 0.6) mood = "sleepy"
  else if (fuel < 0.5 && h >= 10) mood = "hungry"
  else if (hyd < 0.5 && h >= 12) mood = "thirsty"
  else if (r.perfect) mood = "ecstatic"
  else if (r.cleared) mood = "happy"
  else if (d.lifts.some((x) => x.sets.length) || d.runs.length) mood = "pumped"

  return { d, t, T, h, fuel, hyd, energy, mood, r }
}
