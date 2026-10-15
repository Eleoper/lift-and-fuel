import type React from "react"
import { useStore } from "../../store/useStore"
import { useDay, useTargets } from "../../store/derived"
import { totals, fmt, fromKg, U } from "../../game/helpers"
import { PROGRAM } from "../../constants"
import { Bar } from "../shared/Bar"

export function Summary() {
  const profile = useStore((s) => s.profile)
  const day = useDay()
  const T = useTargets()
  const t = totals(day)

  const kcalLeft = Math.max(0, T.kcal - t.kcal)
  const kcalOver = t.kcal > T.kcal

  const prog = PROGRAM[T.ses]
  const dayLabel = T.rest ? "rest day" : "training day"

  const exercises = day.lifts.length
  const sets = day.lifts.reduce((a, x) => a + x.sets.length, 0)
  const volume = day.lifts.reduce(
    (a, x) => a + x.sets.reduce((b, s) => b + fromKg(s.kg, profile) * s.reps, 0),
    0,
  )
  const volUnit = U(profile)

  return (
    <div className="summary" aria-live="polite">
      <section>
        <span className="label">Calories &middot; {dayLabel}</span>
        <div className="big num">
          {fmt(t.kcal)}
          <small>/ {fmt(T.kcal)} kcal</small>
        </div>
        <Bar value={t.kcal} max={T.kcal} />
        <span
          className="hint"
          style={kcalOver ? { color: "var(--warn)" } : undefined}
        >
          {kcalOver
            ? `${fmt(t.kcal - T.kcal)} kcal over`
            : `${fmt(kcalLeft)} kcal left`}
        </span>
      </section>

      <section>
        <span className="label">Macros</span>
        <div>
          <Macro name="Protein" value={t.p} goal={T.protein} color="--protein" />
          <Macro name="Carbs" value={t.c} goal={T.carbs} color="--carbs" />
          <Macro name="Fat" value={t.f} goal={T.fat} color="--fat" />
        </div>
      </section>

      <section>
        <span className="label">Training</span>
        <div className="stats">
          <div>
            <span className="v num">{exercises}</span>
            <span className="label">Exercises</span>
          </div>
          <div>
            <span className="v num">{sets}</span>
            <span className="label">Sets</span>
          </div>
          <div>
            <span className="v num">{fmt(volume)}</span>
            <span className="label">Volume {volUnit}</span>
          </div>
        </div>
        <span className="hint">
          {prog.name} &middot; {prog.time}
        </span>
      </section>
    </div>
  )
}

function Macro({
  name,
  value,
  goal,
  color,
}: {
  name: string
  value: number
  goal: number
  color: string
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  return (
    <div
      className="macro"
      style={{ "--c": `var(${color})` } as React.CSSProperties}
    >
      <b>
        <span className="dot" />
        {name}
      </b>
      <Bar value={value} max={goal} color={color} />
      <span className="num">
        {fmt(value)} / {fmt(goal)} g
        {goal > 0 ? ` (${fmt(pct)}%)` : ""}
      </span>
    </div>
  )
}
