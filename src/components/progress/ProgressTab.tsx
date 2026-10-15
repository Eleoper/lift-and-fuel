import { CheckInForm } from "./CheckInForm"
import { BodyStats } from "./BodyStats"
import { WaistChart } from "./WaistChart"
import { WeeklyStats } from "./WeeklyStats"
import { CalorieChart } from "./CalorieChart"
import { WeightSection } from "./WeightSection"

export function ProgressTab() {
  return (
    <>
      <CheckInForm />
      <BodyStats />
      <WaistChart />
      <WeeklyStats />
      <CalorieChart />
      <WeightSection />
    </>
  )
}
