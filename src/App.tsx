import { useEffect } from "react"
import { useStore } from "./store/useStore"
import { Header } from "./components/layout/Header"
import { Summary } from "./components/layout/Summary"
import { TabBar } from "./components/layout/TabBar"
import { QuestsTab } from "./components/quests/QuestsTab"
import { FoodTab } from "./components/food/FoodTab"
import { TrainingTab } from "./components/training/TrainingTab"
import { ProgressTab } from "./components/progress/ProgressTab"
import { GoalsTab } from "./components/goals/GoalsTab"

export function App() {
  const ready = useStore((s) => s.ready)
  const tab = useStore((s) => s.tab)
  const init = useStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (!ready) {
    return (
      <div className="wrap">
        <div className="box" style={{ textAlign: "center", padding: "40px 20px" }}>
          <span className="hint">Loading your log...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap">
      <Header />
      <Summary />
      <TabBar />

      <div className="panel">
        {tab === "quests" && <QuestsTab />}
        {tab === "food" && <FoodTab />}
        {tab === "training" && <TrainingTab />}
        {tab === "progress" && <ProgressTab />}
        {tab === "goals" && <GoalsTab />}
      </div>

      <div className="foot">
        <span className="status">Saved locally</span>
        <span>Estimated 1RM uses the Epley formula.</span>
      </div>
    </div>
  )
}
