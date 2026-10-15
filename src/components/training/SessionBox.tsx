import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { sessionOf, scheduledSession } from "../../game/targets"
import { PROGRAM, SESS_ORDER } from "../../constants"
import { dateOf } from "../../game/helpers"
import type { SessionType } from "../../types"
import { LiftSession } from "./LiftSession"
import { RunSession } from "./RunSession"
import { RestSession } from "./RestSession"

export function SessionBox() {
  const profile = useStore((s) => s.profile)
  const saveDay = useStore((s) => s.saveDay)
  const date = useStore((s) => s.date)
  const day = useDay()
  const ses = sessionOf(day, profile)
  const Pg = PROGRAM[ses]

  function handleSessionChange(value: string) {
    const sch = scheduledSession(date, profile)
    saveDay(
      { ...day, session: value === sch ? null : (value as SessionType), rest: null },
      `session`,
    )
  }

  return (
    <>
      <div className="box">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span className="label">
              {dateOf(date).toLocaleDateString(undefined, { weekday: "long" })} &middot; {Pg.time}
            </span>
          </div>
          <div className="field" style={{ flex: "0 1 180px" }}>
            <select value={ses} onChange={(e) => handleSessionChange(e.target.value)}>
              {SESS_ORDER.map((k) => (
                <option key={k} value={k}>
                  {PROGRAM[k].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <LiftSession />
      <RunSession />
      <RestSession />
    </>
  )
}
