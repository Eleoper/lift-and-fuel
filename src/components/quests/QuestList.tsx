import { useStore } from "../../store/useStore"
import { useDay, useGameState } from "../../store/derived"
import { quests } from "../../game/quests"
import { sessionOf, scheduledSession } from "../../game/targets"
import { todayKey, shortDate } from "../../game/helpers"
import { PROGRAM, SESS_ORDER, PERFECT_BONUS, PR_XP } from "../../constants"
import type { SessionType } from "../../types"
import { QuestItem } from "./QuestItem"

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`

export function QuestList() {
  const profile = useStore((s) => s.profile)
  const date = useStore((s) => s.date)
  const saveDay = useStore((s) => s.saveDay)
  const day = useDay()
  const G = useGameState()
  const today = todayKey()

  const r = quests(day, profile)
  const ses = sessionOf(day, profile)
  const sch = scheduledSession(date, profile)
  const info = G.days[date]

  const isToday = date === today
  const ruleText = r.perfect
    ? `Every quest done. +${PERFECT_BONUS} XP perfect-day bonus.`
    : r.cleared
      ? `Day cleared. Your streak is safe. Finish all ${r.core.length} for a +${PERFECT_BONUS} XP bonus.`
      : info?.status === "frozen"
        ? "A streak freeze covered this day."
        : info?.status === "missed"
          ? "This day broke the streak. Logging it now still earns XP."
          : `Clear ${r.need} of ${r.core.length} to keep your streak. ${r.need - r.done} to go.`

  function handleSessionChange(value: string) {
    saveDay(
      { ...day, session: value === sch ? null : (value as SessionType), rest: null },
      "session",
    )
  }

  return (
    <div className="box">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h2>{isToday ? "Today's quests" : `Quests for ${shortDate(date)}`}</h2>
        <span className="num">{r.done} / {r.core.length} done</span>
      </div>

      <div className="questmeter">
        {r.core.map((_, i) => (
          <i
            key={i}
            className={`${i < r.done ? "on" : ""}${i === r.need - 1 ? " need" : ""}`}
          />
        ))}
      </div>

      <span className="hint">{ruleText}</span>

      <div className="questlist" style={{ marginTop: 8 }}>
        {r.q.map((x) => (
          <QuestItem
            key={x.id}
            id={x.id}
            stat={x.stat}
            xp={x.xp}
            name={x.name}
            prog={x.prog}
            done={x.done}
            bonus={x.bonus}
            go={x.go}
          />
        ))}
        {info && info.pr > 0 && (
          <div
            className="quest done"
            style={{ "--c": "var(--str)" } as React.CSSProperties}
          >
            <span className="check" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
            <span>
              <span className="qn">New personal record{info.pr > 1 ? "s" : ""}</span>
              <br />
              <span className="qp">{info.pr} PR{info.pr > 1 ? "s" : ""} set</span>
            </span>
            <span className="xp">
              <b>+{PR_XP * info.pr} XP</b>
              <span className="tag">STRENGTH</span>
            </span>
          </div>
        )}
      </div>

      <div className="row" style={{ marginTop: 8, alignItems: "center", gap: 8 }}>
        <span className="hint" style={{ flex: 1 }}>
          {ses === sch
            ? `Scheduled: ${PROGRAM[sch].name}`
            : `Swapped from ${PROGRAM[sch].name}`}
        </span>
        <select
          value={ses}
          onChange={(e) => handleSessionChange(e.target.value)}
          style={{ flex: "0 1 180px" }}
        >
          {SESS_ORDER.map((k) => (
            <option key={k} value={k}>
              {PROGRAM[k].name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
