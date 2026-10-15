import { useState, type FormEvent } from "react"
import { useStore } from "../../store/useStore"
import { avatar } from "../../game/helpers"
import { SKINS, HAIRS, STYLES } from "../../sprites"

export function WardrobeLook() {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)
  const A = avatar(profile)

  const [name, setName] = useState(A.name)

  function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    const nm = (name || "").trim().slice(0, 14) || "Kai"
    saveProfile({ ...profile, avatar: { ...A, name: nm } })
  }

  function setLook(key: string, value: number) {
    saveProfile({ ...profile, avatar: { ...A, [key]: value } })
  }

  return (
    <>
      <form className="row" onSubmit={handleNameSubmit} autoComplete="off">
        <div className="field" style={{ flex: "1 1 180px" }}>
          <label>Name</label>
          <input maxLength={14} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn" type="submit">Save name</button>
      </form>

      <div className="field">
        <label>Skin tone</label>
        <div className="swatches">
          {SKINS.map((c, i) => (
            <button
              key={i}
              type="button"
              className="sw"
              aria-pressed={A.skin === i}
              aria-label={`Skin tone ${i + 1}`}
              style={{ background: c }}
              onClick={() => setLook("skin", i)}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <label>Hair color</label>
        <div className="swatches">
          {HAIRS.map((c, i) => (
            <button
              key={i}
              type="button"
              className="sw"
              aria-pressed={A.hair === i}
              aria-label={`Hair color ${i + 1}`}
              style={{ background: c }}
              onClick={() => setLook("hair", i)}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <label>Hair style</label>
        <div className="chips">
          {STYLES.map((s, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              aria-pressed={A.style === i}
              onClick={() => setLook("style", i)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <span className="hint">
        Your lifter's build follows you: shoulders and arms grow with your Strength level,
        and the waist slims as your logged body fat drops.
      </span>
    </>
  )
}
