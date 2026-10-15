import { useStore } from "../../store/useStore"
import { useDay } from "../../store/derived"
import { isTrainDay } from "../../game/targets"
import { SLOTS } from "../../constants"

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`

export function SupplementStack() {
  const profile = useStore((s) => s.profile)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()

  const stack = profile.stack || []
  const train = isTrainDay(day, profile)
  const req = stack.filter((s) => train || s.slot !== "Pre-gym")
  const taken = req.filter((s) => day.supps[s.id]).length

  function toggleSupp(id: string) {
    const on = !day.supps[id]
    const name = stack.find((s) => s.id === id)?.name ?? "Supplement"
    saveDay(
      { ...day, supps: { ...day.supps, [id]: on } },
      `supp:${JSON.stringify({ type: "supp", on, name })}`,
    )
  }

  if (!stack.length) {
    return (
      <div className="box">
        <h2>Supplement stack</h2>
        <div className="empty">No supplements yet. Add your stack under Goals.</div>
      </div>
    )
  }

  return (
    <div className="box">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h2>Supplement stack</h2>
        <span className="num">{taken} / {req.length}</span>
      </div>

      {SLOTS.map((sl) => {
        const items = stack.filter((s) => s.slot === sl)
        if (!items.length) return null
        const skip = sl === "Pre-gym" && !train

        return (
          <div className={`slot${skip ? " skip" : ""}`} key={sl}>
            <div className="slot-h">
              <span className="label">{sl}</span>
              {skip && <span className="hint">Training days only</span>}
            </div>
            {items.map((s) => (
              <button
                key={s.id}
                type="button"
                className="supp"
                aria-pressed={!!day.supps[s.id]}
                onClick={() => toggleSupp(s.id)}
              >
                <span className="check" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
                <span className="sn">{s.name}</span>
                <span className="sd">{s.dose}</span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
