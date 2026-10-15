import { useStore } from "../../store/useStore"
import { useGameState } from "../../store/derived"
import { unlockedIds } from "../../game/engine"
import { avatar } from "../../game/helpers"
import { ITEMS } from "../../constants"

const LOCK_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`

interface WardrobeSlotProps {
  slot: string
}

export function WardrobeSlot({ slot }: WardrobeSlotProps) {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)
  const G = useGameState()

  const A = avatar(profile)
  const u = unlockedIds(G, profile.goalBf)
  const list = ITEMS.filter((i) => i.slot === slot)

  function equip(id: string) {
    saveProfile({ ...profile, avatar: { ...A, [slot]: id } })
  }

  return (
    <div className="items">
      {list.map((it) => {
        const ok = u.has(it.id)
        const on = A[slot as keyof typeof A] === it.id

        return (
          <button
            key={it.id}
            type="button"
            className={`itm${ok ? "" : " locked"}`}
            aria-pressed={on}
            aria-disabled={!ok}
            onClick={() => ok && equip(it.id)}
          >
            <b>
              {!ok && <span dangerouslySetInnerHTML={{ __html: LOCK_SVG }} />}{" "}
              {it.name}
            </b>
            <span>{on ? "Equipped" : ok ? "Tap to equip" : it.how}</span>
          </button>
        )
      })}
    </div>
  )
}
