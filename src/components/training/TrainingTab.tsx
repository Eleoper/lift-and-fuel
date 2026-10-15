import { WeekStrip } from "./WeekStrip"
import { SessionBox } from "./SessionBox"
import { ExerciseForm } from "./ExerciseForm"
import { CopyWorkout } from "./CopyWorkout"
import { ExercisePanel } from "./ExercisePanel"

export function TrainingTab() {
  return (
    <>
      <WeekStrip />
      <SessionBox />
      <ExerciseForm />
      <CopyWorkout />
      <ExercisePanel />
    </>
  )
}
