import { useState } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { sortedKeys, shortDate, uid } from "../../game/helpers"

export function CopyWorkout() {
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()

  const past = sortedKeys(days)
    .filter((k) => k < date && (days[k]?.lifts as any[])?.length)
    .reverse()
    .slice(0, 12)

  const [selected, setSelected] = useState(past[0] ?? "")

  function handleCopy() {
    if (!selected) return
    const src = days[selected]
    if (!src?.lifts) return
    const have = new Set(day.lifts.map((x) => x.name.toLowerCase()))
    const newLifts = (src.lifts as { name: string; sets: any[] }[])
      .filter((ex) => !have.has(ex.name.toLowerCase()))
      .map((ex) => ({ id: uid(), name: ex.name, sets: [] }))
    if (newLifts.length) {
      saveDay({ ...day, lifts: [...day.lifts, ...newLifts] })
    }
  }

  if (!past.length) {
    return (
      <div className="box">
        <span className="hint">
          Tip: once you've logged a workout, you can repeat it here in one tap.
        </span>
      </div>
    )
  }

  return (
    <div className="box row">
      <div className="field" style={{ flex: "1 1 260px" }}>
        <label>Repeat a past workout</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {past.map((k) => {
            const lifts = (days[k]?.lifts as { name: string }[]) || []
            return (
              <option key={k} value={k}>
                {shortDate(k)}: {lifts.map((x) => x.name).join(", ")}
              </option>
            )
          })}
        </select>
      </div>
      <button className="btn" type="button" onClick={handleCopy}>
        Add these exercises
      </button>
    </div>
  )
}
