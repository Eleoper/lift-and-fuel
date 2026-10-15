import { useRecentFoods } from "../../hooks/useRecentFoods"
import { fmt } from "../../game/helpers"

interface QuickAddProps {
  onFill: (food: { name: string; meal?: string; kcal: number; p: number; c: number; f: number }) => void
}

export function QuickAdd({ onFill }: QuickAddProps) {
  const list = useRecentFoods()
  const isRecent = list.length > 0 && list[0]!.p !== undefined

  return (
    <div className="box">
      <span className="label">
        {isRecent ? "Your recent foods" : "Quick add (common foods; tap to fill the form)"}
      </span>
      <div className="chips" style={{ marginTop: 4 }}>
        {list.map((x, i) => (
          <button key={i} type="button" className="chip" onClick={() => onFill(x)}>
            {x.name}
            <em>{fmt(x.kcal)}</em>
          </button>
        ))}
      </div>
    </div>
  )
}
