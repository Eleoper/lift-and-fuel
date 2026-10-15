import { useGameState } from "../../store/derived"
import { fmt } from "../../game/helpers"
import { ACH } from "../../constants"

function plate(c: string, size = 38): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="var(${c})" stroke-width="6"/><circle cx="20" cy="20" r="8" fill="none" stroke="var(${c})" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="var(${c})"/></svg>`
}

export function Achievements() {
  const G = useGameState()

  const unlocked = ACH.filter((a) => Math.min(a.val(G), a.goal) >= a.goal).length

  return (
    <div className="box">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h2>Achievements</h2>
        <span className="num">
          {unlocked} / {ACH.length} unlocked
        </span>
      </div>

      <div className="achlist">
        {ACH.map((a) => {
          const val = Math.min(a.val(G), a.goal)
          const ok = val >= a.goal

          return (
            <div className={`medal${ok ? "" : " locked"}`} key={a.id}>
              <span dangerouslySetInnerHTML={{ __html: plate(a.c) }} />
              <div className="mt">
                <b>{a.name}</b>
                <span className="hint">{a.desc}</span>
                <span className="hint num">
                  {ok ? "Unlocked" : `${fmt(val)} / ${fmt(a.goal)}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
