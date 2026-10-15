import type { Day, Profile, SessionType, Targets } from "../types"
import { PROGRAM, WEEK } from "../constants"
import { dateOf } from "./helpers"

export function scheduledSession(k: string, profile: Profile): SessionType {
  const W = profile.week || WEEK
  return (W[dateOf(k).getDay()] as SessionType | undefined) || "mobility"
}

export function sessionOf(d: Day, profile: Profile): SessionType {
  if (d.session && PROGRAM[d.session]) return d.session
  if (d.rest === true) return "mobility"
  return scheduledSession(d.date, profile)
}

export function isTrainDay(d: Day, profile: Profile): boolean {
  return sessionOf(d, profile) !== "mobility"
}

export function targets(d: Day, profile: Profile): Targets {
  const ses = sessionOf(d, profile)
  const rest = ses === "mobility"
  const long = ses === "long"
  const fuel = long ? { kcal: 325, c: 82 } : { kcal: 0, c: 0 }
  return {
    kcal: (rest && profile.restKcal ? profile.restKcal : profile.kcal) + fuel.kcal,
    protein: profile.protein,
    carbs:
      (rest && profile.restCarbs != null ? profile.restCarbs : profile.carbs) + fuel.c,
    fat: rest && profile.restFat != null ? profile.restFat : profile.fat,
    rest,
    long,
    ses,
  }
}
