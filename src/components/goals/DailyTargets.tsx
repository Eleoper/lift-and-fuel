import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { n, fmt } from "../../game/helpers"

export function DailyTargets() {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)

  const [kcal, setKcal] = useState(String(profile.kcal))
  const [protein, setProtein] = useState(String(profile.protein))
  const [carbs, setCarbs] = useState(String(profile.carbs))
  const [fat, setFat] = useState(String(profile.fat))
  const [unit, setUnit] = useState(profile.unit)
  const [restKcal, setRestKcal] = useState(String(profile.restKcal ?? profile.kcal))
  const [restCarbs, setRestCarbs] = useState(String(profile.restCarbs ?? profile.carbs))
  const [restFat, setRestFat] = useState(String(profile.restFat ?? profile.fat))

  const macroKcal = n(protein) * 4 + n(carbs) * 4 + n(fat) * 9
  const diff = Math.abs(macroKcal - n(kcal))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveProfile({
      ...profile,
      kcal: n(kcal),
      protein: n(protein),
      carbs: n(carbs),
      fat: n(fat),
      unit,
      restKcal: n(restKcal),
      restCarbs: n(restCarbs),
      restFat: n(restFat),
    })
  }

  return (
    <form className="box" onSubmit={handleSubmit} autoComplete="off">
      <h2>Daily targets</h2>

      <div className="row">
        <div className="field" style={{ flex: "0 1 100px" }}>
          <label>Units</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as "lb" | "kg")}>
            <option value="lb">lb / in / mi</option>
            <option value="kg">kg / cm / km</option>
          </select>
        </div>
      </div>

      <span className="label">Training days</span>
      <div className="row">
        <div className="field"><label>Calories</label><input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} /></div>
        <div className="field"><label>Protein g</label><input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
        <div className="field"><label>Carbs g</label><input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></div>
        <div className="field"><label>Fat g</label><input type="number" value={fat} onChange={(e) => setFat(e.target.value)} /></div>
      </div>

      <span className="label">Rest days</span>
      <div className="row">
        <div className="field"><label>Calories</label><input type="number" value={restKcal} onChange={(e) => setRestKcal(e.target.value)} /></div>
        <div className="field"><label>Protein g</label><input type="number" value={protein} disabled /></div>
        <div className="field"><label>Carbs g</label><input type="number" value={restCarbs} onChange={(e) => setRestCarbs(e.target.value)} /></div>
        <div className="field"><label>Fat g</label><input type="number" value={restFat} onChange={(e) => setRestFat(e.target.value)} /></div>
      </div>

      <span className="hint">
        Training-day macros add up to {fmt(macroKcal)} kcal (protein and carbs 4 kcal/g, fat 9 kcal/g)
        {n(kcal) > 0
          ? diff <= 60
            ? ", which matches your calorie target."
            : `, ${fmt(diff)} kcal ${macroKcal > n(kcal) ? "above" : "below"} your calorie target.`
          : "."}
      </span>

      <button className="btn primary" type="submit">Save targets</button>
    </form>
  )
}
