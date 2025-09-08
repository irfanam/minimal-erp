import React, { useState } from 'react'

interface Prefs { email: boolean; inApp: boolean; sound: boolean; dailySummary: boolean }

interface Props { value?: Prefs; onChange?: (p: Prefs) => void }

const defaults: Prefs = { email: true, inApp: true, sound: false, dailySummary: true }

export const NotificationSettings: React.FC<Props> = ({ value = defaults, onChange }) => {
  const [prefs, setPrefs] = useState<Prefs>(value)
  const toggle = (k: keyof Prefs) => {
    const next = { ...prefs, [k]: !prefs[k] }
    setPrefs(next)
    onChange?.(next)
  }
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-neutral-700">Notification Settings</h4>
      <div className="space-y-2">
        {(['email','inApp','sound','dailySummary'] as (keyof Prefs)[]).map(k => (
          <label key={k} className="flex items-center gap-2 text-[11px] text-neutral-700">
            <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} />
            <span className="capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
