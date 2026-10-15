import { useStore } from "../../store/useStore"
import { useGameState } from "../../store/derived"
import { unlockedIds } from "../../game/engine"
import { ITEMS } from "../../constants"
import { WardrobeSlot } from "./WardrobeSlot"
import { WardrobeLook } from "./WardrobeLook"

const WARD_TABS = [
  { id: "outfit", label: "Outfit" },
  { id: "head", label: "Head" },
  { id: "gear", label: "Gear" },
  { id: "scene", label: "Scene" },
  { id: "look", label: "Look" },
]

export function Wardrobe() {
  const ward = useStore((s) => s.ward)
  const setWard = useStore((s) => s.setWard)
  const G = useGameState()
  const profile = useStore((s) => s.profile)
  const u = unlockedIds(G, profile.goalBf)

  return (
    <details className="box">
      <summary>
        <h2 style={{ display: "inline" }}>Wardrobe</h2>
        <span className="num" style={{ marginLeft: 8 }}>
          {ITEMS.filter((i) => u.has(i.id)).length} / {ITEMS.length} unlocked
        </span>
      </summary>

      <div className="wardtabs" style={{ marginTop: 8 }}>
        {WARD_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-selected={ward === t.id}
            onClick={() => setWard(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {ward === "look" ? <WardrobeLook /> : <WardrobeSlot slot={ward} />}
      </div>
    </details>
  )
}
