import { useState, useEffect, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { n, fmt } from "../../game/helpers"

export function RecoveryPanel() {
  const profile = useStore((s) => s.profile)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()

  const [sleepVal, setSleepVal] = useState(day.sleep != null ? String(day.sleep) : "")
  const [stepsVal, setStepsVal] = useState(day.steps != null ? String(day.steps) : "")

  useEffect(() => {
    setSleepVal(day.sleep != null ? String(day.sleep) : "")
    setStepsVal(day.steps != null ? String(day.steps) : "")
  }, [date, day.sleep, day.steps])

  function addWater(amt: number) {
    saveDay(
      { ...day, water: Math.max(0, day.water + amt) },
      `water:${JSON.stringify({ type: "water", amt })}`,
    )
  }

  function handleSleep(e: FormEvent) {
    e.preventDefault()
    const v = Math.min(16, Math.max(0, n(sleepVal)))
    saveDay({ ...day, sleep: v }, "sleep")
  }

  function handleSteps(e: FormEvent) {
    e.preventDefault()
    const v = Math.max(0, Math.round(n(stepsVal)))
    saveDay({ ...day, steps: v }, "steps")
  }

  const waterPct = profile.waterGoal ? Math.min(100, (day.water / profile.waterGoal) * 100) : 0

  return (
    <div className="box">
      <h2>Recovery</h2>

      {/* Water */}
      <div style={{ marginBottom: 12 }}>
        <span className="label">Water</span>
        <span className="num" style={{ marginLeft: 8 }}>
          {fmt(day.water)} / {fmt(profile.waterGoal)} oz
        </span>
        <div className="bar" style={{ marginTop: 4 }}>
          <i style={{ width: `${waterPct}%` }} />
        </div>
        <div className="row" style={{ marginTop: 4, gap: 4 }}>
          <button className="btn sm" type="button" onClick={() => addWater(8)}>+8 oz</button>
          <button className="btn sm" type="button" onClick={() => addWater(16)}>+16 oz</button>
          <button className="btn sm" type="button" onClick={() => addWater(24)}>+24 oz</button>
          <button className="btn sm" type="button" onClick={() => addWater(-8)}>&minus;8 oz</button>
        </div>
      </div>

      {/* Sleep */}
      <form className="row" onSubmit={handleSleep} autoComplete="off" style={{ marginBottom: 8 }}>
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label>Sleep the night before (hours) &middot; goal {fmt(profile.sleepGoal, 2)}</label>
          <input
            type="number"
            min="0"
            max="16"
            step="0.25"
            inputMode="decimal"
            value={sleepVal}
            onChange={(e) => setSleepVal(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">Save</button>
      </form>

      {/* Steps */}
      <form className="row" onSubmit={handleSteps} autoComplete="off">
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label>Steps &middot; goal {fmt(profile.stepGoal)}</label>
          <input
            type="number"
            min="0"
            step="100"
            inputMode="numeric"
            value={stepsVal}
            onChange={(e) => setStepsVal(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
