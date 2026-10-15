import { useMemo } from "react"
import { useStore } from "./useStore"
import { game } from "../game/engine"
import { targets } from "../game/targets"
import { vitals } from "../game/vitals"
import { getDay } from "../game/helpers"
import type { Day, GameState, Targets, Vitals } from "../types"
import { useShallow } from "zustand/react/shallow"

export function useGameState(): GameState {
  const { days, profile } = useStore(
    useShallow((s) => ({ days: s.days, profile: s.profile })),
  )
  return useMemo(() => game(days, profile), [days, profile])
}

export function useTargets(): Targets {
  const { days, date, profile } = useStore(
    useShallow((s) => ({ days: s.days, date: s.date, profile: s.profile })),
  )
  return useMemo(() => targets(getDay(days, date), profile), [days, date, profile])
}

export function useVitals(): Vitals {
  const days = useStore((s) => s.days)
  const profile = useStore((s) => s.profile)
  return vitals(days, profile)
}

export function useDay(dateKey?: string): Day {
  const { days, date } = useStore(
    useShallow((s) => ({ days: s.days, date: s.date })),
  )
  const k = dateKey ?? date
  return useMemo(() => getDay(days, k), [days, k])
}
