import { useRef } from "react"
import { MealPlan } from "./MealPlan"
import { FoodForm, type FoodFormHandle } from "./FoodForm"
import { QuickAdd } from "./QuickAdd"
import { MealList } from "./MealList"

export function FoodTab() {
  const formRef = useRef<FoodFormHandle>(null)

  function handleQuickFill(food: { name: string; meal?: string; kcal: number; p: number; c: number; f: number }) {
    formRef.current?.fill(food)
  }

  function handleDinnerExact() {
    formRef.current?.setDinnerExact()
  }

  return (
    <>
      <MealPlan onDinnerExact={handleDinnerExact} />
      <QuickAdd onFill={handleQuickFill} />
      <FoodForm ref={formRef} />
      <MealList />
    </>
  )
}
