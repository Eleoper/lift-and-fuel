import { useMemo } from "react"
import { useStore } from "../store/useStore"
import { STARTER_LIFTS } from "../constants"

export function useExerciseNames(): string[] {
  const days = useStore((s) => s.days)

  return useMemo(() => {
    const names = new Set<string>(STARTER_LIFTS)
    for (const k in days) {
      const lifts = days[k]?.lifts
      if (!lifts) continue
      for (const x of lifts) names.add(x.name)
    }
    return [...names].sort()
  }, [days])
}
