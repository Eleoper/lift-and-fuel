import { useStore } from "../../store/useStore"
import { fromCm, sortedKeys } from "../../game/helpers"
import { LineChart } from "../shared/LineChart"

export function WaistChart() {
  const days = useStore((s) => s.days)
  const profile = useStore((s) => s.profile)

  const wk = sortedKeys(days).filter((k) => days[k]?.waist != null)
  const pts = wk.slice(-26).map((k) => ({
    k,
    v: Math.round(fromCm(days[k]!.waist as number, profile) * 100) / 100,
  }))

  if (pts.length < 2) {
    return (
      <div className="box">
        <h2>Waist trend</h2>
        <div className="empty">
          {pts.length
            ? "One check-in so far. Log another next week to see the trend."
            : "Log your waist weekly to see the trend. It's the clearest sign of fat loss while you build muscle."}
        </div>
      </div>
    )
  }

  return (
    <div className="box">
      <h2>Waist trend</h2>
      <LineChart pts={pts} label="Waist trend" dec={1} />
    </div>
  )
}
