import { QuestList } from "./QuestList"
import { BossPanel } from "./BossPanel"
import { SupplementStack } from "./SupplementStack"
import { RecoveryPanel } from "./RecoveryPanel"

export function QuestGrid() {
  return (
    <div className="questgrid">
      <div className="qg-left">
        <QuestList />
      </div>
      <div className="qg-right">
        <BossPanel />
        <SupplementStack />
        <RecoveryPanel />
      </div>
    </div>
  )
}
