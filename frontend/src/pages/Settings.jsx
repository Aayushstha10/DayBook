import { useState } from 'react'

const defaultSettings = [
  { id: 'notifications', label: 'Email me a weekly summary', description: 'A digest of the past week\u2019s spending, every Monday.', enabled: true },
  { id: 'budgetAlerts', label: 'Budget alerts', description: 'Warn me when a category goes over budget.', enabled: true },
  { id: 'roundUp', label: 'Round up amounts', description: 'Display amounts rounded to the nearest dollar.', enabled: false },
  { id: 'darkMode', label: 'Dark sidebar', description: 'Keep the sidebar dark regardless of system theme.', enabled: true }
]

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings)

  const toggle = (id) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white rounded-card border border-black/5 shadow-card divide-y divide-black/5">
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-5">
            <div className="pr-4">
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <p className="text-xs text-slate mt-0.5">{s.description}</p>
            </div>
            <Toggle checked={s.enabled} onChange={() => toggle(s.id)} label={s.label} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card border border-black/5 shadow-card p-5">
        <p className="text-sm font-medium text-ink">Export data</p>
        <p className="text-xs text-slate mt-0.5 mb-3">Download everything as a CSV file.</p>
        <button className="btn-ghost border border-black/10">Export as CSV</button>
      </div>

      <div className="bg-white rounded-card border border-rust/20 shadow-card p-5">
        <p className="text-sm font-medium text-rust">Danger zone</p>
        <p className="text-xs text-slate mt-0.5 mb-3">Permanently clear all transactions from this browser.</p>
        <button className="btn-danger">Clear all data</button>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors shrink-0 relative
        ${checked ? 'bg-moss' : 'bg-black/10'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}
