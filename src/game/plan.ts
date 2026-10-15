import type { Day, PlanMealDef, PlanMealResolved, Profile, Totals } from "../types"
import { DINNER, DINNER_SIZES, LONG_FUEL, PF, PLAN } from "../constants"
import { sessionOf } from "./targets"

function planItem([k, q]: [string, number]): Totals & { name: string } {
  const F = PF[k]
  if (!F) return { name: k, kcal: 0, p: 0, c: 0, f: 0 }
  const r = q / F.per
  const label =
    F.unit === "g"
      ? `${F.name}, ${q} g`
      : F.unit
        ? `${F.name}, ${q} ${F.unit}${q > 1 ? "s" : ""}`
        : q > 1
          ? `${F.name} × ${q}`
          : F.name
  return {
    name: label,
    kcal: Math.round(F.kcal * r),
    p: Math.round(F.p * r * 10) / 10,
    c: Math.round(F.c * r * 10) / 10,
    f: Math.round(F.f * r * 10) / 10,
  }
}

export function planMeals(d: Day, profile: Profile): PlanMealResolved[] {
  const ses = sessionOf(d, profile)
  const base: PlanMealDef[] =
    ses === "mobility"
      ? PLAN.rest
      : ses === "long"
        ? [...PLAN.train, LONG_FUEL]
        : PLAN.train

  return base.map((m) => {
    const items = m.items.map((it) => planItem(it as [string, number]))
    const t = m.flex
      ? { ...DINNER_SIZES.reg }
      : items.reduce(
          (a, x) => ({
            kcal: a.kcal + x.kcal,
            p: a.p + x.p,
            c: a.c + x.c,
            f: a.f + x.f,
          }),
          { kcal: 0, p: 0, c: 0, f: 0 },
        )
    return { ...m, list: items, t }
  })
}

export function planLogged(d: Day, id: string): boolean {
  return d.foods.some(
    (x) => x.plan === id || (id === DINNER.id && x.meal === "Dinner"),
  )
}

export function nextPlanMeal(
  d: Day,
  profile: Profile,
): PlanMealResolved | undefined {
  return planMeals(d, profile).find((m) => !planLogged(d, m.id))
}
