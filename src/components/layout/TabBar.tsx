import { useStore, type TabId } from "../../store/useStore"

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "quests", label: "Quests", icon: "\u2694" },
  { id: "food", label: "Food", icon: "\u25CB" },
  { id: "training", label: "Training", icon: "\u25B2" },
  { id: "progress", label: "Progress", icon: "\u25A0" },
  { id: "goals", label: "Goals", icon: "\u2605" },
]

export function TabBar() {
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)

  return (
    <div className="tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === tab}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
