import { useMemo } from "react"
import { useStore } from "../store/useStore"
import { sortedKeys } from "../game/helpers"
import { STARTER_FOODS } from "../constants"

interface RecentFood {
  name: string
  meal?: string
  kcal: number
  p: number
  c: number
  f: number
}

export function useRecentFoods(): RecentFood[] {
  const days = useStore((s) => s.days)

  return useMemo(() => {
    const seen = new Set<string>()
    const recent: RecentFood[] = []
    for (const k of sortedKeys(days).reverse()) {
      const foods = days[k]?.foods
      if (!foods) continue
      for (let i = foods.length - 1; i >= 0; i--) {
        const x = foods[i]!
        if (x.plan) continue
        const nm = x.name.toLowerCase()
        if (!seen.has(nm)) {
          seen.add(nm)
          recent.push({ name: x.name, meal: x.meal, kcal: x.kcal, p: x.p, c: x.c, f: x.f })
        }
        if (recent.length >= 10) break
      }
      if (recent.length >= 10) break
    }
    return recent.length ? recent : STARTER_FOODS.map((f) => ({ ...f }))
  }, [days])
}
