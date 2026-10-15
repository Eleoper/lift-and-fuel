/* ---------- Ally sprites: Coach Brock, Gym Companion, Cardio Master ---------- */

import { OUTFITS, type OutfitDef } from "./core"
import { drawSprite, type SpriteOpts } from "./hero"

interface AllyDef {
  name: string
  o: Omit<SpriteOpts, "pose" | "frame" | "m" | "f"> & { m: number; f: number }
  expr: string
}

export const ALLIES: Record<string, AllyDef> = {
  coach: {
    name: "Coach Brock",
    o: {
      m: 2,
      f: 3,
      skinColor: "#E3A982",
      hairColor: "#C4C8CF",
      style: "Gray",
      outfitDef: OUTFITS.track as OutfitDef,
      extras: ["whistle", "clipboard"],
      brows: true,
      jowls: true,
      shoe: "#F1F2F4",
    },
    expr: "stern",
  },
  buddy: {
    name: "Gym Companion",
    o: {
      m: 0,
      f: 1,
      skinColor: "#F1C7A5",
      hairColor: "#7A4A2A",
      style: "Ponytail",
      outfitDef: OUTFITS.crop as OutfitDef,
      extras: ["towel", "bottle"],
      shoe: "#B9A6F0",
    },
    expr: "smile",
  },
  cardio: {
    name: "Cardio Master",
    o: {
      m: 0,
      f: 1,
      skinColor: "#F1C7A5",
      hairColor: "#B5572B",
      style: "BigCurly",
      outfitDef: OUTFITS.aerobic as OutfitDef,
      extras: ["band", "headset", "warmers", "wristbands"],
      bandColor: "#F2D33C",
      shoe: "#F3A6CE",
    },
    expr: "excited",
  },
}

export function drawAlly(
  id: string,
  pose: string,
  frame: number,
  blink: boolean,
): HTMLCanvasElement {
  const A = ALLIES[id]!
  return drawSprite(
    {
      ...A.o,
      pose,
      frame,
      blink,
      expr:
        pose === "idle"
          ? A.expr
          : pose === "flex" || pose === "cheer"
            ? "excited"
            : A.expr,
    },
    "ally",
  )
}
