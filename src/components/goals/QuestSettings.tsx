import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { n, fromCm, toCm, LU } from "../../game/helpers"
import type { SessionType } from "../../types"
import { SESS_ORDER, PROGRAM, DOW } from "../../constants"

export function QuestSettings() {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)

  const [water, setWater] = useState(String(profile.waterGoal))
  const [sleep, setSleep] = useState(String(profile.sleepGoal))
  const [steps, setSteps] = useState(String(profile.stepGoal))
  const [goalBf, setGoalBf] = useState(String(profile.goalBf ?? 15))
  const [height, setHeight] = useState(
    String(Math.round(fromCm(profile.heightCm || 165.1, profile) * 2) / 2),
  )

  function handleWeekChange(dayIdx: number, value: string) {
    saveProfile({
      ...profile,
      week: { ...profile.week, [dayIdx]: value as SessionType },
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveProfile({
      ...profile,
      waterGoal: n(water) || 100,
      sleepGoal: n(sleep) || 7,
      stepGoal: Math.round(n(steps)) || 8000,
      goalBf: n(goalBf) || 15,
      heightCm: toCm(n(height), profile) || profile.heightCm || 165.1,
    })
  }

  return (
    <>
      <div className="box">
        <h2>Weekly layout</h2>
        <div className="row">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => (
            <div className="field" key={i} style={{ flex: "1 1 118px" }}>
              <label>{DOW[i]}</label>
              <select
                value={profile.week[i] ?? "mobility"}
                onChange={(e) => handleWeekChange(i, e.target.value)}
              >
                {SESS_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {PROGRAM[k].name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <form className="box" onSubmit={handleSubmit} autoComplete="off">
        <h2>Quest settings</h2>
        <div className="row">
          <div className="field">
            <label>Water goal (oz)</label>
            <input type="number" value={water} onChange={(e) => setWater(e.target.value)} />
          </div>
          <div className="field">
            <label>Sleep goal (hours)</label>
            <input type="number" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} />
          </div>
          <div className="field">
            <label>Step goal</label>
            <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>Goal body fat %</label>
            <input type="number" step="0.5" value={goalBf} onChange={(e) => setGoalBf(e.target.value)} />
          </div>
          <div className="field">
            <label>Height ({LU(profile)})</label>
            <input type="number" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>
        <button className="btn primary" type="submit">Save settings</button>
      </form>
    </>
  )
}
