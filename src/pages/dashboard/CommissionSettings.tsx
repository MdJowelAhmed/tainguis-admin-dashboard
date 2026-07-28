import { useEffect, useState } from 'react'
import { App, InputNumber, Switch } from 'antd'
import { Save } from 'lucide-react'
import {
  updateCommission,
  useCommissions,
} from '../../components/commission/commissionStore'

export default function CommissionSettings() {
  const commissions = useCommissions()
  const setting = commissions[0]
  const { message } = App.useApp()

  const [percentage, setPercentage] = useState(setting?.percentage ?? 8)
  const [active, setActive] = useState(setting?.active ?? true)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!setting) return
    setPercentage(setting.percentage)
    setActive(setting.active)
    setDirty(false)
  }, [setting?.id, setting?.percentage, setting?.active])

  if (!setting) {
    return (
      <div className="py-6">
        <p className="text-sm text-gray-500">No commission configured.</p>
      </div>
    )
  }

  const save = () => {
    if (percentage < 0 || percentage > 100) {
      return message.warning('Percentage must be between 0 and 100.')
    }
    updateCommission(setting.id, { percentage, active })
    setDirty(false)
    message.success('App Charge updated.')
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Commission Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the platform fee applied to every transaction.
        </p>
      </header>

      <section className="max-w-xl rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {setting.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
              active
                ? 'bg-green-100 text-green-700 ring-green-200'
                : 'bg-gray-100 text-gray-700 ring-gray-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              App Charge percentage
            </label>
            <div className="mt-1.5">
              <InputNumber
                value={percentage}
                onChange={(val) => {
                  setPercentage(val ?? 0)
                  setDirty(true)
                }}
                min={0}
                max={100}
                step={0.1}
                suffix="%"
                style={{ width: '100%' }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Platform takes this percentage from each transaction.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Status
              </label>
              <p className="text-xs text-gray-500">
                {active
                  ? 'App Charge is being applied to transactions.'
                  : 'App Charge is paused.'}
              </p>
            </div>
            <Switch
              checked={active}
              onChange={(val) => {
                setActive(val)
                setDirty(true)
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-4">
            <span className="text-xs text-gray-500">
              Last updated {setting.updatedAt}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              Save changes
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
