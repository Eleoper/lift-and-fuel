import { useStore } from "../../store/useStore"
import { weekOf, getDay, dateOf, shift, fmt, fromKm, DU } from "../../game/helpers"
import { sessionOf } from "../../game/targets"
import { quests } from "../../game/quests"
import { PROGRAM, SHORT, DOW } from "../../constants"
import { todayKey } from "../../game/helpers"

export function WeekStrip() {
  const date = useStore((s) => s.date)
  const days = useStore((s) => s.days)
  const profile = useStore((s) => s.profile)
  const setDate = useStore((s) => s.setDate)
  const today = todayKey()
  const wk = weekOf(date)

  let lifts = 0
  let runs = 0
  let km = 0

  const buttons = [...Array(7)].map((_, i) => {
    const k = shift(wk, i)
    const d = getDay(days, k)
    const ses = sessionOf(d, profile)
    const Pg = PROGRAM[ses]
    const q = quests(d, profile).q.find((x) => x.id === "train")
    const done = !!(q && q.done)

    if (done && Pg.kind === "lift") lifts++
    if (d.runs.length) runs++
    km += d.runs.reduce((a, r) => a + (r.km || 0), 0)

    const c = Pg.kind === "lift" ? "--str" : Pg.kind === "run" ? "--end" : "--vit"

    return (
      <button
        key={k}
        type="button"
        className={`wd${done ? " done" : ""}${k === date ? " sel" : ""}${k === today ? " today" : ""}`}
        style={{ "--c": `var(${c})` } as React.CSSProperties}
        onClick={() => setDate(k)}
      >
        <span>{DOW[dateOf(k).getDay()]}</span>
        <b>{SHORT[ses]}</b>
        <i />
      </button>
    )
  })

  return (
    <div className="box">
      <div className="week">{buttons}</div>
      <span className="hint num" style={{ textAlign: "center", display: "block", marginTop: 4 }}>
        {lifts}/3 lifts &middot; {runs}/3 runs &middot; {fmt(fromKm(km, profile), 1)} {DU(profile)}
      </span>
    </div>
  )
}
