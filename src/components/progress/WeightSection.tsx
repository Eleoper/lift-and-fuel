import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { e1rm, avgWeight } from "../../game/records"
import { n, fmt, fromKg, toKg, w1, U, shortDate, sortedKeys, shift, todayKey } from "../../game/helpers"
import { LineChart } from "../shared/LineChart"

export function WeightSection() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const today = todayKey()
  const unit = U(profile)

  const [wVal, setWVal] = useState(day.weight != null ? String(w1(day.weight, profile)) : "")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const v = n(wVal)
    if (!v) return
    saveDay({ ...day, weight: toKg(v, profile) }, "weigh")
  }

  // Weight chart data
  const pts = sortedKeys(days)
    .filter((k) => days[k]?.weight != null)
    .slice(-60)
    .map((k) => ({ k, v: w1(days[k]!.weight as number, profile) }))

  let chartContent: React.ReactNode
  if (pts.length < 2) {
    chartContent = (
      <div className="empty">
        {pts.length
          ? `One weigh-in so far (${pts[0]!.v} ${unit}). Log another day to see the trend.`
          : "Weigh in each morning. The 7-day average smooths out water swings."}
      </div>
    )
  } else {
    const avg = pts.map((p) => {
      const a = avgWeight(days, p.k)
      return { k: p.k, v: a != null ? Math.round(fromKg(a, profile) * 10) / 10 : p.v }
    })
    const lp = avg[avg.length - 1]!
    const prevA = avgWeight(days, shift(lp.k, -7))
    const rate = prevA != null ? lp.v - fromKg(prevA, profile) : null

    chartContent = (
      <>
        <LineChart pts={pts} avg={avg} label="Body weight with 7-day average" />
        <p className="hint" style={{ margin: "6px 0 0" }}>
          7-day average <b className="num">{fmt(lp.v, 1)} {unit}</b>
          {rate != null && (
            <>
              {" "}&middot;{" "}
              <span className="num">{rate > 0 ? "+" : ""}{fmt(rate, 1)}</span> {unit} this week. Aim for &minus;1 to &minus;1.5.
            </>
          )}{" "}
          Dots are single days.
        </p>
      </>
    )
  }

  // PRs table
  const best: Record<string, { name: string; e: number; s: { kg: number; reps: number }; k: string }> = {}
  for (const k of sortedKeys(days)) {
    const lifts = days[k]?.lifts
    if (!lifts) continue
    for (const ex of lifts as { name: string; sets: { kg: number; reps: number }[] }[]) {
      for (const s of ex.sets) {
        if (!s.kg) continue
        const nm = ex.name.trim()
        const key = nm.toLowerCase()
        const e = e1rm(s.kg, s.reps)
        if (!best[key] || e > best[key]!.e) {
          best[key] = { name: nm, e, s, k }
        }
      }
    }
  }
  const prs = Object.values(best).sort((a, b) => b.e - a.e)

  return (
    <>
      <div className="box">
        <form className="row" onSubmit={handleSubmit} autoComplete="off">
          <div className="field" style={{ flex: "1 1 200px" }}>
            <label>Weigh-in for {date === today ? "today" : shortDate(date)} ({unit})</label>
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={wVal}
              onChange={(e) => setWVal(e.target.value)}
            />
          </div>
          <button className="btn primary" type="submit">Save</button>
        </form>
      </div>

      <div className="box">
        <h2>Weight trend</h2>
        {chartContent}
      </div>

      <div className="box">
        <h2>Personal records</h2>
        {prs.length ? (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th className="r">Best set</th>
                  <th className="r">Est. 1RM</th>
                </tr>
              </thead>
              <tbody>
                {prs.map((p) => (
                  <tr key={p.name}>
                    <td>
                      {p.name}
                      <div className="hint">{shortDate(p.k)}</div>
                    </td>
                    <td className="num r">
                      {w1(p.s.kg, profile)} &times; {p.s.reps}
                    </td>
                    <td className="num r">
                      <b>{fmt(fromKg(p.e, profile))}</b> {unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            Your best lifts show up here once you log weighted sets.
          </div>
        )}
      </div>
    </>
  )
}
