import { useState } from "react"
import { useStore } from "../../store/useStore"
import { n, fmt, U, fromKg, fromCm } from "../../game/helpers"
import { latestWeight } from "../../game/records"
import { LB } from "../../constants"

export function TdeeEstimator() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const saveProfile = useStore((s) => s.saveProfile)

  const unit = U(profile)
  const lw = latestWeight(days)

  const [sex, setSex] = useState("m")
  const [age, setAge] = useState("")
  const [height, setHeight] = useState(
    unit === "kg"
      ? String(Math.round(profile.heightCm || 165.1))
      : String(Math.round(fromCm(profile.heightCm || 165.1, profile) * 2) / 2),
  )
  const [weight, setWeight] = useState(lw != null ? String(Math.round(fromKg(lw, profile) * 10) / 10) : "")
  const [activity, setActivity] = useState("1.55")
  const [goal, setGoal] = useState("-500")

  const ageN = n(age)
  const hN = n(height)
  const wN = n(weight)
  const actN = n(activity)
  const goalN = n(goal)

  let result: { kcal: number; protein: number; carbs: number; fat: number; tdee: number } | null = null

  if (ageN > 0 && hN > 0 && wN > 0) {
    const kg = unit === "lb" ? wN * LB : wN
    const cm = unit === "lb" ? hN * 2.54 : hN
    const bmr = 10 * kg + 6.25 * cm - 5 * ageN + (sex === "m" ? 5 : -161)
    const tdee = bmr * actN
    const kcal = Math.round((tdee + goalN) / 10) * 10
    const protein = Math.round((kg / LB) * 0.8)
    const fat = Math.round((kcal * 0.25) / 9)
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
    result = { kcal, protein, carbs, fat, tdee }
  }

  function useEstimate() {
    if (!result) return
    saveProfile({
      ...profile,
      kcal: result.kcal,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    })
  }

  return (
    <div className="box">
      <h2>TDEE estimator</h2>
      <span className="hint">Mifflin-St Jeor equation. A starting point, not gospel.</span>

      <div className="row" style={{ marginTop: 8 }}>
        <div className="field" style={{ flex: "0 1 80px" }}>
          <label>Sex</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="m">Male</option>
            <option value="f">Female</option>
          </select>
        </div>
        <div className="field" style={{ flex: "0 1 80px" }}>
          <label>Age</label>
          <input type="number" min="10" max="99" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="field">
          <label>Height ({unit === "lb" ? "in" : "cm"})</label>
          <input type="number" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="field">
          <label>Weight ({unit})</label>
          <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
      </div>
      <div className="row">
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label>Activity multiplier</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">Sedentary (desk job, no exercise)</option>
            <option value="1.375">Lightly active (1-3 days/week)</option>
            <option value="1.55">Moderately active (3-5 days/week)</option>
            <option value="1.725">Very active (6-7 days/week)</option>
          </select>
        </div>
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label>Goal adjustment (kcal)</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="0">Maintenance (0)</option>
            <option value="-250">Mild cut (-250)</option>
            <option value="-500">Standard cut (-500)</option>
            <option value="-750">Aggressive cut (-750)</option>
            <option value="250">Lean bulk (+250)</option>
            <option value="500">Bulk (+500)</option>
          </select>
        </div>
      </div>

      {result ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <div className="stats">
            <div>
              <span className="v num">{fmt(result.kcal)}</span>
              <span className="label">kcal</span>
            </div>
            <div>
              <span className="v num" style={{ color: "var(--protein)" }}>{result.protein}</span>
              <span className="label">Protein g</span>
            </div>
            <div>
              <span className="v num" style={{ color: "var(--carbs)" }}>{result.carbs}</span>
              <span className="label">Carbs g</span>
            </div>
            <div>
              <span className="v num" style={{ color: "var(--fat)" }}>{result.fat}</span>
              <span className="label">Fat g</span>
            </div>
          </div>
          <span className="hint">
            Maintenance &asymp; {fmt(Math.round(result.tdee / 10) * 10)} kcal &middot; protein 0.8 g per lb of body weight
          </span>
          <button className="btn primary" type="button" onClick={useEstimate}>
            Use for training days
          </button>
        </div>
      ) : (
        <span className="hint">Enter age, height and weight to see an estimate.</span>
      )}
    </div>
  )
}
