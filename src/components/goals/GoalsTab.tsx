import { DailyTargets } from "./DailyTargets"
import { QuestSettings } from "./QuestSettings"
import { StackEditor } from "./StackEditor"
import { TdeeEstimator } from "./TdeeEstimator"

export function GoalsTab() {
  return (
    <>
      <DailyTargets />
      <QuestSettings />
      <StackEditor />
      <TdeeEstimator />
    </>
  )
}
