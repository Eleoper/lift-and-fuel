import type { Day, Profile } from "../types"
import { DEFAULT_PROFILE } from "../constants"

export interface StorageData {
  profile: Profile
  days: Record<string, Partial<Day>>
}

export function loadFromStorage(): StorageData {
  try {
    const raw = localStorage.getItem("liftfuel:v1")
    if (raw) {
      const o = JSON.parse(raw) as Partial<StorageData>
      return {
        days: o.days ?? {},
        profile: { ...DEFAULT_PROFILE, ...(o.profile ?? {}) },
      }
    }
  } catch {
    /* ignore corrupt or unavailable storage */
  }
  return { profile: { ...DEFAULT_PROFILE }, days: {} }
}

export function saveToStorage(data: StorageData): void {
  try {
    localStorage.setItem("liftfuel:v1", JSON.stringify(data))
  } catch {
    // Storage full or blocked
  }
}
