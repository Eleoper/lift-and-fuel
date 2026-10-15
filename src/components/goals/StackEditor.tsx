import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { uid, esc } from "../../game/helpers"
import { SLOTS } from "../../constants"

export function StackEditor() {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)
  const stack = profile.stack || []

  const [name, setName] = useState("")
  const [dose, setDose] = useState("")
  const [slot, setSlot] = useState<"Morning" | "Pre-gym" | "Evening">("Morning")

  function handleDelete(id: string) {
    saveProfile({ ...profile, stack: stack.filter((s) => s.id !== id) })
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    saveProfile({
      ...profile,
      stack: [...stack, { id: uid(), name: trimmed, dose: dose.trim(), slot }],
    })
    setName("")
    setDose("")
  }

  return (
    <div className="box">
      <h2>Supplement stack</h2>

      {stack.length ? (
        stack.map((s) => (
          <div className="stackrow" key={s.id}>
            <span className="sn">{s.name}</span>
            <span className="hint num">{s.dose}</span>
            <span className="label">{s.slot}</span>
            <button
              className="x"
              type="button"
              aria-label={`Remove ${esc(s.name)}`}
              onClick={() => handleDelete(s.id)}
            >
              &times;
            </button>
          </div>
        ))
      ) : (
        <div className="empty">Your stack is empty. Add what you take below.</div>
      )}

      <form className="row" onSubmit={handleAdd} autoComplete="off" style={{ marginTop: 12 }}>
        <div className="field" style={{ flex: "1 1 140px" }}>
          <label>Supplement name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: "1 1 100px" }}>
          <label>Dose</label>
          <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 5 g" />
        </div>
        <div className="field" style={{ flex: "0 1 120px" }}>
          <label>Time of day</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value as "Morning" | "Pre-gym" | "Evening")}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button className="btn primary" type="submit">Add</button>
      </form>
    </div>
  )
}
