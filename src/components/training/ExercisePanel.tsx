import { useState, useRef, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { lastTime, progEx, suggest, e1rm } from "../../game/records"
import { n, fmt, fromKg, toKg, w1, shortDate, U } from "../../game/helpers"
import type { Lift } from "../../types"

export function ExercisePanel() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const unit = U(profile)

  function deleteExercise(id: string) {
    saveDay({ ...day, lifts: day.lifts.filter((x) => x.id !== id) })
  }

  function deleteSet(exId: string, setIdx: number) {
    saveDay({
      ...day,
      lifts: day.lifts.map((ex) =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex,
      ),
    })
  }

  function addSet(exId: string, kg: number, reps: number) {
    saveDay(
      {
        ...day,
        lifts: day.lifts.map((ex) =>
          ex.id === exId ? { ...ex, sets: [...ex.sets, { kg, reps }] } : ex,
        ),
      },
      `set:${JSON.stringify({ type: "set", ex: day.lifts.find((x) => x.id === exId)?.name ?? "", w: fromKg(kg, profile), reps })}`,
    )
  }

  if (!day.lifts.length) {
    return (
      <div className="box">
        <div className="empty">
          No exercises for this day. Add one above, for example "Bench press",
          then log each set's weight and reps.
        </div>
      </div>
    )
  }

  return (
    <>
      {day.lifts.map((ex) => (
        <ExerciseCard
          key={ex.id}
          ex={ex}
          unit={unit}
          days={days}
          date={date}
          profile={profile}
          onDeleteEx={deleteExercise}
          onDeleteSet={deleteSet}
          onAddSet={addSet}
        />
      ))}
    </>
  )
}

function ExerciseCard({
  ex,
  unit,
  days,
  date,
  profile,
  onDeleteEx,
  onDeleteSet,
  onAddSet,
}: {
  ex: Lift
  unit: string
  days: Record<string, Partial<import("../../types").Day>>
  date: string
  profile: import("../../types").Profile
  onDeleteEx: (id: string) => void
  onDeleteSet: (exId: string, setIdx: number) => void
  onAddSet: (exId: string, kg: number, reps: number) => void
}) {
  const lt = lastTime(days, ex.name, date)
  const pe = progEx(ex.name)
  const sg = pe ? suggest(pe, days, date, profile) : null

  let lastTxt = "First time logging this exercise"
  if (pe && sg) {
    lastTxt = `Target ${pe.sets}\u00d7${pe.lo}${pe.hi > pe.lo ? `\u2013${pe.hi}` : ""} \u00b7 ${sg.txt}`
  } else if (lt) {
    const top = lt.ex.sets.reduce((a, s) => (s.kg > a.kg ? s : a), lt.ex.sets[0]!)
    lastTxt = `Last time (${shortDate(lt.date)}): ${lt.ex.sets.length} sets, top ${w1(top.kg, profile)} ${unit} \u00d7 ${top.reps}. Beat it for a PR.`
  }

  const pre = ex.sets.length
    ? ex.sets[ex.sets.length - 1]!
    : sg && sg.kg != null && pe
      ? { kg: sg.kg, reps: pe.lo }
      : lt
        ? lt.ex.sets[0]!
        : null

  const [w, setW] = useState(pre ? String(w1(pre.kg, profile)) : "")
  const [r, setR] = useState(pre ? String(pre.reps) : "")
  const repsRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const reps = Math.round(n(r))
    if (reps < 1) return
    const kg = toKg(n(w), profile)
    onAddSet(ex.id, kg, reps)
    repsRef.current?.focus()
    repsRef.current?.select()
  }

  return (
    <div className="ex box" style={{ padding: 0, gap: 0 }}>
      <div className="ex-h">
        <div style={{ minWidth: 0 }}>
          <h3>{ex.name}</h3>
          <div className="last">{lastTxt}</div>
        </div>
        <button
          className="x"
          type="button"
          aria-label={`Remove ${ex.name}`}
          onClick={() => onDeleteEx(ex.id)}
        >
          &times;
        </button>
      </div>

      {ex.sets.length > 0 && (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Set</th>
                <th className="r">Weight {unit}</th>
                <th className="r">Reps</th>
                <th className="r">Est. 1RM</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ex.sets.map((s, i) => (
                <tr key={i}>
                  <td className="num">{i + 1}</td>
                  <td className="num r">{w1(s.kg, profile)}</td>
                  <td className="num r">{s.reps}</td>
                  <td className="num r muted">{fmt(fromKg(e1rm(s.kg, s.reps), profile), 0)}</td>
                  <td className="r">
                    <button
                      className="x"
                      type="button"
                      aria-label={`Remove set ${i + 1}`}
                      onClick={() => onDeleteSet(ex.id, i)}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="addset" onSubmit={handleSubmit} autoComplete="off">
        <div className="field">
          <label>Weight {unit}</label>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={w}
            onChange={(e) => setW(e.target.value)}
            placeholder="0 = bodyweight"
          />
        </div>
        <div className="field">
          <label>Reps</label>
          <input
            ref={repsRef}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={r}
            onChange={(e) => setR(e.target.value)}
            required
          />
        </div>
        <button className="btn primary" type="submit">Add set</button>
      </form>
    </div>
  )
}
