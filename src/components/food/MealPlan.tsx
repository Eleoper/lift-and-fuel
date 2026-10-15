import { useStore } from "../../store/useStore"
import { useDay, useTargets } from "../../store/derived"
import { planMeals, planLogged } from "../../game/plan"
import { totals, fmt, uid } from "../../game/helpers"
import { DINNER, DINNER_SIZES } from "../../constants"

interface MealPlanProps {
  onDinnerExact: () => void
}

export function MealPlan({ onDinnerExact }: MealPlanProps) {
  const profile = useStore((s) => s.profile)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const T = useTargets()
  const meals = planMeals(day, profile)
  const t = totals(day)

  function logPlan(id: string) {
    const m = meals.find((x) => x.id === id)
    if (!m) return
    const newFoods = m.list.map((it) => ({
      id: uid(),
      meal: m.meal,
      name: it.name,
      kcal: it.kcal,
      p: it.p,
      c: it.c,
      f: it.f,
      qty: 1,
      plan: m.id,
    }))
    saveDay({ ...day, foods: [...day.foods, ...newFoods] }, `plan:${m.name}`)
  }

  function undoPlan(id: string) {
    const foods = day.foods.filter(
      (x) => x.plan !== id && !(id === DINNER.id && x.meal === "Dinner"),
    )
    saveDay({ ...day, foods })
  }

  function logDinner(size: string) {
    const z = DINNER_SIZES[size as keyof typeof DINNER_SIZES]
    if (!z) return
    const item = {
      id: uid(),
      meal: "Dinner",
      name: `Mom's dinner, ${z.label.toLowerCase()}`,
      kcal: z.kcal,
      p: z.p,
      c: z.c,
      f: z.f,
      qty: 1,
      plan: DINNER.id,
    }
    saveDay({ ...day, foods: [...day.foods, item] }, `dinner:${size}`)
  }

  const planTotal = meals.reduce(
    (a, m) => ({ kcal: a.kcal + m.t.kcal, p: a.p + m.t.p }),
    { kcal: 0, p: 0 },
  )

  return (
    <div className="box">
      <h2>
        Meal plan{" "}
        <span className="hint" style={{ fontWeight: 500 }}>
          &middot; {T.rest ? "Rest day" : T.long ? "Long-run day" : "Training day"}
        </span>
      </h2>

      {meals.map((m) => {
        const done = planLogged(day, m.id)

        if (m.flex) {
          const dinnerFoods = day.foods.filter((x) => x.meal === "Dinner")
          const dk = dinnerFoods.reduce((a, x) => a + x.kcal * (x.qty || 1), 0)
          const dp = dinnerFoods.reduce((a, x) => a + x.p * (x.qty || 1), 0)
          const pLeft = Math.max(0, Math.round(T.protein - (t.p - dp)))

          return (
            <div className="pmeal" key={m.id}>
              <h3>
                {m.name}{" "}
                <span className="hint" style={{ fontWeight: 500 }}>
                  &middot; {m.when}
                </span>
              </h3>
              <span className="its">
                Whatever's cooking. Fill half the plate with veg, take a palm-to-hand-sized
                portion of the meat or fish, and a fist of the rice, pasta or potatoes.
              </span>
              <span className="mac">
                {done ? (
                  <>
                    <b>{fmt(dk)} kcal</b> &middot;{" "}
                    <span style={{ color: "var(--protein)" }}>P {fmt(dp)}</span> logged
                  </>
                ) : (
                  <>
                    Aim for{" "}
                    <span style={{ color: "var(--protein)" }}>
                      {pLeft > 0
                        ? `about ${fmt(Math.min(60, Math.max(30, pLeft)))} g protein`
                        : "30+ g protein"}
                    </span>{" "}
                    from this plate
                  </>
                )}
              </span>
              <div className="act">
                {done ? (
                  <>
                    <button className="btn sm done" type="button" disabled>
                      Logged
                    </button>
                    <button className="btn sm" type="button" onClick={() => undoPlan(m.id)}>
                      Undo
                    </button>
                  </>
                ) : (
                  <>
                    {(Object.entries(DINNER_SIZES) as [string, { label: string; kcal: number }][]).map(
                      ([k, v]) => (
                        <button
                          key={k}
                          className={`btn sm${k === "reg" ? " primary" : ""}`}
                          type="button"
                          onClick={() => logDinner(k)}
                        >
                          {v.label.split(" ")[0]} ~{v.kcal}
                        </button>
                      ),
                    )}
                    <button className="btn sm" type="button" onClick={onDinnerExact}>
                      Log exact
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        }

        return (
          <div className="pmeal" key={m.id}>
            <h3>
              {m.name}
              {m.when && (
                <span className="hint" style={{ fontWeight: 500 }}>
                  {" "}
                  &middot; {m.when}
                </span>
              )}
            </h3>
            <span className="its">{m.list.map((x) => x.name).join(" \u00b7 ")}</span>
            <span className="mac">
              <b>{fmt(m.t.kcal)} kcal</b> &middot;{" "}
              <span style={{ color: "var(--protein)" }}>P {fmt(m.t.p)}</span> &middot;{" "}
              <span style={{ color: "var(--carbs)" }}>C {fmt(m.t.c)}</span> &middot;{" "}
              <span style={{ color: "var(--fat)" }}>F {fmt(m.t.f)}</span>
            </span>
            <div className="act">
              {done ? (
                <>
                  <button className="btn sm done" type="button" disabled>
                    Logged
                  </button>
                  <button className="btn sm" type="button" onClick={() => undoPlan(m.id)}>
                    Undo
                  </button>
                </>
              ) : (
                <button className="btn sm primary" type="button" onClick={() => logPlan(m.id)}>
                  Log meal
                </button>
              )}
            </div>
          </div>
        )
      })}

      <p className="hint" style={{ marginTop: 8 }}>
        Plan total about {fmt(planTotal.kcal)} kcal &middot; {fmt(planTotal.p)} g protein, counting
        dinner as a regular plate. A light (400) or big (800) dinner still clears the calorie quest.
        Rice is cooked weight.
      </p>
    </div>
  )
}
