import { useStore } from "../../store/useStore"
import { shift, getDay, totals } from "../../game/helpers"
import { targets } from "../../game/targets"
import { BarChart } from "../shared/BarChart"

export function CalorieChart() {
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)
  const profile = useStore((s) => s.profile)

  const dayKeys = [...Array(14)].map((_, i) => shift(date, i - 13))
  const values = dayKeys.map((k) => totals(getDay(days, k)).kcal)
  const tg = dayKeys.map((k) => targets(getDay(days, k), profile).kcal)
  const goal = profile.kcal || 0

  const hasData = values.some((v) => v > 0)

  return (
    <div className="box">
      <h2>Calories (14 days)</h2>
      <BarChart
        days={dayKeys}
        values={values}
        targets={tg}
        selectedDate={date}
        goal={goal}
      />
      <p className="hint" style={{ margin: "8px 0 0" }}>
        {hasData
          ? "Dashes mark each day's target: training days are higher than rest days."
          : "Bars appear as you log food. Dashes mark each day's target."}
      </p>
    </div>
  )
}
