import { useState, useRef, useImperativeHandle, forwardRef, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { uid, n } from "../../game/helpers"
import { MEALS } from "../../constants"

export interface FoodFormHandle {
  fill(food: { name: string; meal?: string; kcal: number; p: number; c: number; f: number }): void
  setDinnerExact(): void
}

export const FoodForm = forwardRef<FoodFormHandle>(function FoodForm(_, ref) {
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()

  const [meal, setMeal] = useState("Breakfast")
  const [name, setName] = useState("")
  const [kcal, setKcal] = useState("")
  const [p, setP] = useState("")
  const [c, setC] = useState("")
  const [f, setF] = useState("")
  const [qty, setQty] = useState("1")

  const nameRef = useRef<HTMLInputElement>(null)
  const qtyRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    fill(food) {
      setName(food.name)
      setKcal(String(food.kcal))
      setP(String(food.p))
      setC(String(food.c))
      setF(String(food.f))
      setQty("1")
      if (food.meal && (MEALS as readonly string[]).includes(food.meal)) setMeal(food.meal)
      qtyRef.current?.focus()
      qtyRef.current?.select()
    },
    setDinnerExact() {
      setMeal("Dinner")
      setName("Mom's dinner: ")
      nameRef.current?.focus()
      nameRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
    },
  }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const qtyVal = n(qty) || 1
    const item = {
      id: uid(),
      meal,
      name: trimmed,
      kcal: n(kcal),
      p: n(p),
      c: n(c),
      f: n(f),
      qty: qtyVal,
    }
    saveDay(
      { ...day, foods: [...day.foods, item] },
      `food:${JSON.stringify({ type: "food", item: { name: trimmed, p: item.p * qtyVal } })}`,
    )
    setName("")
    setKcal("")
    setP("")
    setC("")
    setF("")
    setQty("1")
    nameRef.current?.focus()
  }

  return (
    <form className="box" onSubmit={handleSubmit} autoComplete="off">
      <h2>Add food</h2>
      <div className="row">
        <div className="field" style={{ flex: "0 1 140px" }}>
          <label>Meal</label>
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label>Food name</label>
          <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>kcal</label>
          <input type="number" min="0" step="1" inputMode="decimal" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </div>
        <div className="field">
          <label>Protein</label>
          <input type="number" min="0" step="0.1" inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        <div className="field">
          <label>Carbs</label>
          <input type="number" min="0" step="0.1" inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
        <div className="field">
          <label>Fat</label>
          <input type="number" min="0" step="0.1" inputMode="decimal" value={f} onChange={(e) => setF(e.target.value)} />
        </div>
        <div className="field" style={{ flex: "0 1 60px" }}>
          <label>Qty</label>
          <input ref={qtyRef} type="number" min="0.25" step="0.25" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <button className="btn primary" type="submit">Add</button>
      </div>
    </form>
  )
})
