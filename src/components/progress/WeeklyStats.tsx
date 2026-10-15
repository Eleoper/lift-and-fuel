import { useStore } from "../../store/useStore"
import { getDay, shift, totals, fmt } from "../../game/helpers"

export function WeeklyStats() {
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)

  const keys = [...Array(7)].map((_, i) => shift(date, -i))
  const fed = keys.map((k) => getDay(days, k)).filter((d) => d.foods.length)
  const avgK = fed.length ? fed.reduce((a, d) => a + totals(d).kcal, 0) / fed.length : 0
  const avgP = fed.length ? fed.reduce((a, d) => a + totals(d).p, 0) / fed.length : 0
  const trained = keys.filter((k) => getDay(days, k).lifts.length).length

  return (
    <div className="box">
      <h2>7-day rolling</h2>
      <div className="stats">
        <div>
          <span className="v num">{fed.length ? fmt(avgK) : "\u2013"}</span>
          <span className="label">Avg kcal / day</span>
        </div>
        <div>
          <span className="v num">{fed.length ? fmt(avgP) : "\u2013"}</span>
          <span className="label">Avg protein g</span>
        </div>
        <div>
          <span className="v num">{fed.length}/7</span>
          <span className="label">Days logged</span>
        </div>
        <div>
          <span className="v num">{trained}</span>
          <span className="label">Training days</span>
        </div>
      </div>
    </div>
  )
}
