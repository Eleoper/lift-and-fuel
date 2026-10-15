import { create } from "zustand"
import type { Day, Profile } from "../types"
import { DEFAULT_PROFILE } from "../constants"
import { todayKey } from "../game/helpers"
import { loadFromStorage, saveToStorage } from "./storage"

export type TabId = "quests" | "food" | "training" | "progress" | "goals"

interface StoreState {
  profile: Profile
  days: Record<string, Partial<Day>>
  date: string
  tab: TabId
  ward: string
  ready: boolean
}

interface StoreActions {
  saveDay: (day: Partial<Day>, evt?: string) => void
  saveProfile: (profile: Profile) => void
  setDate: (k: string) => void
  setTab: (tab: TabId) => void
  setWard: (w: string) => void
  init: () => void
}

export type Store = StoreState & StoreActions

export const useStore = create<Store>()((set, get) => ({
  profile: { ...DEFAULT_PROFILE },
  days: {},
  date: todayKey(),
  tab: "quests",
  ward: "",
  ready: false,

  saveDay(day, _evt?) {
    const k = day.date ?? get().date
    const next = {
      ...get().days,
      [k]: { ...get().days[k], ...day, date: k },
    }
    set({ days: next })
    saveToStorage({ profile: get().profile, days: next })
  },

  saveProfile(profile) {
    set({ profile })
    saveToStorage({ profile, days: get().days })
  },

  setDate(k) {
    set({ date: k })
  },

  setTab(tab) {
    set({ tab })
  },

  setWard(w) {
    set({ ward: w })
  },

  init() {
    const data = loadFromStorage()
    set({ profile: data.profile, days: data.days, ready: true })
  },
}))
