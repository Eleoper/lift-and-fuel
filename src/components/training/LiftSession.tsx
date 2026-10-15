import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { sessionOf } from "../../game/targets"
import { suggest } from "../../game/records"
import { uid } from "../../game/helpers"
import { PROGRAM } from "../../constants"

export function LiftSession() {
  const profile = useStore((s) => s.profile)
  const days = useStore((s) => s.days)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const ses = sessionOf(day, profile)
  const Pg = PROGRAM[ses]

  if (Pg.kind !== "lift") return null

  const have = new Set(day.lifts.map((x) => x.name.toLowerCase()))
  const missing = Pg.ex.filter((e) => !have.has(e.n.toLowerCase()))

  function loadLifts() {
    const newLifts = missing.map((e) => ({ id: uid(), name: e.n, sets: [] }))
    saveDay({ ...day, lifts: [...day.lifts, ...newLifts] }, "load")
  }

  return (
    <div className="box">
      <h2>{Pg.name}</h2>
      <span className="hint">{Pg.goal}</span>

      <div className="prog" style={{ marginTop: 8 }}>
        {Pg.ex.map((e) => {
          const sg = suggest(e, days, date, profile)
          const ex = day.lifts.find((x) => x.name.toLowerCase() === e.n.toLowerCase())
          const dn = ex ? ex.sets.length : 0

          return (
            <div className="prow" key={e.n}>
              <b>
                {e.n}
                {e.alt && <span className="hint" style={{ fontWeight: 400 }}> {e.alt}</span>}
              </b>
              <span className="tg">
                {dn ? `${dn} of ` : ""}
                {e.sets}&times;{e.lo}{e.hi > e.lo ? `\u2013${e.hi}` : ""}
              </span>
              <span className="sub">
                {sg.up ? <em>{sg.txt}</em> : sg.txt}
              </span>
            </div>
          )
        })}
      </div>

      <div className="row" style={{ marginTop: 12, alignItems: "center", justifyContent: "space-between" }}>
        <span className="hint" style={{ flex: "1 1 240px" }}>
          Lift heavy, stay controlled, leave 1&ndash;2 reps in reserve. Top of the range on every set
          means add weight next time.
        </span>
        {missing.length > 0 ? (
          <button className="btn primary" type="button" onClick={loadLifts}>
            {missing.length === Pg.ex.length ? "Load today's lifts" : "Load the rest"}
          </button>
        ) : (
          <span className="hint">All {Pg.ex.length} exercises are loaded below.</span>
        )}
      </div>
    </div>
  )
}
