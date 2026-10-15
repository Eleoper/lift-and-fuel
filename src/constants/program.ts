import type { ProgramEntry, SessionType, WeekSchedule } from "../types"

export const PROGRAM: Record<SessionType, ProgramEntry> = {
  push: {
    name: "Upper Push",
    kind: "lift",
    goal: "Chest, shoulders, triceps.",
    time: "40–50 min",
    ex: [
      { n: "Bench press", alt: "or DB press", sets: 4, lo: 6, hi: 8, inc: 5 },
      { n: "Incline DB press", sets: 3, lo: 8, hi: 10, inc: 5 },
      { n: "Shoulder press", sets: 3, lo: 6, hi: 8, inc: 5 },
      { n: "Triceps pushdown", alt: "or dips", sets: 3, lo: 10, hi: 12, inc: 5 },
      { n: "Lateral raise", sets: 3, lo: 12, hi: 15, inc: 2.5 },
    ],
  },
  pull: {
    name: "Upper Pull",
    kind: "lift",
    goal: "Back, biceps, posture.",
    time: "40–50 min",
    ex: [
      { n: "Lat pulldown", alt: "or pull-ups", sets: 4, lo: 6, hi: 10, inc: 5 },
      { n: "Barbell row", alt: "or seated row", sets: 3, lo: 6, hi: 8, inc: 5 },
      { n: "Face pull", sets: 3, lo: 12, hi: 15, inc: 5 },
      { n: "Hammer curl", sets: 3, lo: 10, hi: 12, inc: 5 },
      { n: "Reverse fly", sets: 3, lo: 12, hi: 15, inc: 2.5 },
    ],
  },
  legs: {
    name: "Lower Body",
    kind: "lift",
    goal: "Strong legs without ruining your long run. Keep 2 reps in reserve.",
    time: "40–50 min",
    ex: [
      { n: "Back squat", alt: "or leg press", sets: 3, lo: 5, hi: 6, inc: 10 },
      { n: "Romanian deadlift", sets: 3, lo: 6, hi: 8, inc: 10 },
      { n: "Bulgarian split squat", alt: "each leg", sets: 2, lo: 8, hi: 8, inc: 5 },
      { n: "Leg curl", sets: 2, lo: 12, hi: 15, inc: 5 },
      { n: "Calf raise", sets: 2, lo: 15, hi: 20, inc: 10 },
    ],
  },
  speed: {
    name: "Speed Run",
    kind: "run",
    goal: "Get faster and boost VO₂ max. Warm up 10–15 min easy first.",
    time: "45–60 min",
    opts: [
      "6×400 m at 5K pace, 90 s rest",
      "10×200 m fast, walk/jog recovery",
      "20 min tempo, comfortably hard",
    ],
  },
  easy: {
    name: "Easy Run",
    kind: "run",
    goal: "Build your engine. Zone 2: you can talk in full sentences. Add volume, don't exhaust yourself.",
    time: "30–50 min",
  },
  long: {
    name: "Long Run",
    kind: "run",
    goal: "Endurance and mental resilience. Easy pace the whole way, and practice fueling past the first hour.",
    time: "60–120 min",
  },
  mobility: {
    name: "Off / Mobility",
    kind: "rest",
    goal: "Recovery. This is where gains come to life, so treat it as seriously as a workout.",
    time: "15–30 min",
    list: [
      "Hip and hamstring flow, 10 min",
      "Thoracic spine and shoulders, 5 min",
      "Foam roll calves, quads and upper back",
      "Easy walk outside",
      "Weekly check-in: waist, body fat, photos",
    ],
  },
}

export const SESS_ORDER: SessionType[] = [
  "push",
  "speed",
  "pull",
  "easy",
  "legs",
  "long",
  "mobility",
]

export const SHORT: Record<SessionType, string> = {
  push: "Push",
  speed: "Speed",
  pull: "Pull",
  easy: "Easy",
  legs: "Legs",
  long: "Long",
  mobility: "Rest",
}

export const WEEK: WeekSchedule = {
  1: "push",
  2: "speed",
  3: "pull",
  4: "easy",
  5: "legs",
  6: "long",
  0: "mobility",
}
