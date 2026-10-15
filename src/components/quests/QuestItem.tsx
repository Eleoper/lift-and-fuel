import { useStore } from "../../store/useStore"
import { STATS } from "../../constants"

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`

interface QuestItemProps {
  id: string
  stat: string
  xp: number
  name: string
  prog: string
  done: boolean
  bonus?: boolean
  go?: string
}

export function QuestItem({ stat, xp, name, prog, done, bonus, go }: QuestItemProps) {
  const setTab = useStore((s) => s.setTab)
  const s = STATS[stat as keyof typeof STATS]
  const Tag = go ? "button" : "div"

  return (
    <Tag
      {...(go ? { type: "button" as const, onClick: () => setTab(go as any) } : {})}
      className={`quest${done ? " done" : ""}`}
      style={{ "--c": `var(${s?.c ?? "--accent"})` } as React.CSSProperties}
    >
      <span className="check" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
      <span style={{ minWidth: 0 }}>
        <span className="qn">{name}</span>
        <br />
        <span className="qp">{prog}</span>
      </span>
      <span className="xp">
        <b>+{xp} XP</b>
        <span className="tag">
          {bonus ? "BONUS \u00b7 " : ""}
          {s?.name.toUpperCase() ?? stat.toUpperCase()}
        </span>
      </span>
    </Tag>
  )
}
