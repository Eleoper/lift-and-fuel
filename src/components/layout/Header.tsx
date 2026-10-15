import type React from "react"
import { useStore } from "../../store/useStore"
import { useGameState } from "../../store/derived"
import { dateOf, shift, todayKey, shortDate } from "../../game/helpers"
import { levelOf } from "../../game/engine"
import { DOW } from "../../constants"

const FLAME_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 1.8c.6 3.3-1.6 5-3 6.9C8.4 10.3 7.5 12 7.5 14a4.5 4.5 0 0 0 9 0c0-1.4-.5-2.6-1.2-3.6 1.9.7 3.7 2.8 3.7 5.6A7 7 0 0 1 5 16c0-4.6 3.3-7 5.2-9.6 1-1.4 1.8-2.9 2.4-4.6zM12 12.5c.9 1 1.8 2 1.8 3.2a1.8 1.8 0 0 1-3.6 0c0-1.2.9-2.2 1.8-3.2z"/></svg>`

function formatDateLabel(dateKey: string, today: string): string {
  if (dateKey === today) return "Today"
  if (dateKey === shift(today, -1)) return "Yesterday"
  const d = dateOf(dateKey)
  const dow = DOW[d.getDay()] ?? "?"
  return `${dow}, ${shortDate(dateKey)}`
}

export function Header() {
  const date = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const setTab = useStore((s) => s.setTab)
  const gs = useGameState()

  const today = todayKey()
  const lv = levelOf(gs.xp)
  const label = formatDateLabel(date, today)

  function goTo(k: string) {
    if (k > today) return
    setDate(k)
  }

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v) goTo(v)
  }

  return (
    <header className="top">
      <div className="brand">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          aria-hidden="true"
        >
          <circle
            cx="15"
            cy="15"
            r="13"
            fill="none"
            stroke="var(--protein)"
            strokeWidth="4"
          />
          <circle
            cx="15"
            cy="15"
            r="7"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2"
          />
          <circle cx="15" cy="15" r="2.5" fill="var(--ink)" />
        </svg>
        <h1>Lift &amp; Fuel</h1>
        <button
          className="lvchip"
          type="button"
          aria-label={`Level ${lv.L}, ${gs.streak}-day streak. Open quests`}
          onClick={() => setTab("quests")}
        >
          <b className="num">Lv {lv.L}</b>
          <span dangerouslySetInnerHTML={{ __html: FLAME_SVG }} />
          <span className="num">{gs.streak}</span>
        </button>
      </div>
      <nav className="datenav" aria-label="Choose day">
        <button
          className="iconbtn"
          aria-label="Previous day"
          onClick={() => goTo(shift(date, -1))}
        >
          &#8249;
        </button>
        <span className="when">{label}</span>
        <button
          className="iconbtn"
          aria-label="Next day"
          disabled={date >= today}
          onClick={() => goTo(shift(date, 1))}
        >
          &#8250;
        </button>
        <input
          type="date"
          aria-label="Pick a date"
          value={date}
          max={today}
          onChange={handleDateInput}
        />
        {date !== today && (
          <button className="btn" onClick={() => setDate(today)}>
            Today
          </button>
        )}
      </nav>
    </header>
  )
}
