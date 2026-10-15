import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { sessionOf } from "../../game/targets"
import { PROGRAM } from "../../constants"

export function RestSession() {
  const profile = useStore((s) => s.profile)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const ses = sessionOf(day, profile)
  const Pg = PROGRAM[ses]

  if (Pg.kind !== "rest") return null

  function toggleMob() {
    saveDay({ ...day, mob: !day.mob }, day.mob ? undefined : "mob")
  }

  return (
    <div className="box">
      <h2>{Pg.name}</h2>
      <span className="hint">{Pg.goal}</span>

      <ul className="note" style={{ paddingLeft: 18, margin: "8px 0 12px" }}>
        {Pg.list!.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>

      <button
        className={`btn${day.mob ? " done" : " primary"}`}
        type="button"
        onClick={toggleMob}
      >
        {day.mob ? "Mobility done" : "Mark mobility done"}
      </button>
    </div>
  )
}
