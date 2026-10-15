import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { uid } from "../../game/helpers"
import { useExerciseNames } from "../../hooks/useExerciseNames"

export function ExerciseForm() {
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const names = useExerciseNames()
  const [name, setName] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    saveDay({ ...day, lifts: [...day.lifts, { id: uid(), name: trimmed, sets: [] }] })
    setName("")
  }

  return (
    <form className="box row" onSubmit={handleSubmit} autoComplete="off">
      <div className="field" style={{ flex: "1 1 200px" }}>
        <label>Add exercise</label>
        <input
          list="exNames"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. "Bench press"'
          required
        />
        <datalist id="exNames">
          {names.map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
      </div>
      <button className="btn primary" type="submit">Add</button>
    </form>
  )
}
