import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { fmt } from "../../game/helpers"
import { MEALS } from "../../constants"

export function MealList() {
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()

  function deleteFood(id: string) {
    saveDay({ ...day, foods: day.foods.filter((x) => x.id !== id) })
  }

  if (!day.foods.length) {
    return (
      <div className="box">
        <div className="empty">
          Nothing logged for this day yet. Tap Log meal on your plan, or add a food above.
        </div>
      </div>
    )
  }

  const allMeals = [...MEALS, ...new Set(day.foods.map((x) => x.meal).filter((m) => !(MEALS as readonly string[]).includes(m)))]

  return (
    <div className="box">
      {allMeals.map((m) => {
        const items = day.foods.filter((x) => x.meal === m)
        if (!items.length) return null
        const sub = items.reduce((a, x) => a + x.kcal * (x.qty || 1), 0)

        return (
          <div className="meal" key={m}>
            <div className="meal-h">
              <h3>{m}</h3>
              <span className="num muted">{fmt(sub)} kcal</span>
            </div>
            {items.map((x) => {
              const q = x.qty || 1
              return (
                <div className="item" key={x.id}>
                  <div className="name">
                    {x.name}
                    {q !== 1 && (
                      <span className="muted num"> &times; {fmt(q, 2)}</span>
                    )}
                  </div>
                  <div className="mac num">
                    <b>{fmt(x.kcal * q)}</b> &middot;{" "}
                    <span style={{ color: "var(--protein)" }}>P {fmt(x.p * q)}</span> &middot;{" "}
                    <span style={{ color: "var(--carbs)" }}>C {fmt(x.c * q)}</span> &middot;{" "}
                    <span style={{ color: "var(--fat)" }}>F {fmt(x.f * q)}</span>
                  </div>
                  <button
                    className="x"
                    type="button"
                    aria-label={`Remove ${x.name}`}
                    onClick={() => deleteFood(x.id)}
                  >
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
