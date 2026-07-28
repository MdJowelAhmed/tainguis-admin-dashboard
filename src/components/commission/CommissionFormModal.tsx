import { useState } from 'react'
import { App, Input, Modal, InputNumber, Switch } from 'antd'
import { createCommission, updateCommission } from './commissionStore'
import type { CommissionSetting } from './commissionData'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  commission?: CommissionSetting | null
  onClose: () => void
}

const emptyState = {
  name: '',
  percentage: 8,
  active: true,
}

export default function CommissionFormModal({
  open,
  mode,
  commission,
  onClose,
}: Props) {
  const { message } = App.useApp()
  const [name, setName] = useState(emptyState.name)
  const [percentage, setPercentage] = useState(emptyState.percentage)
  const [active, setActive] = useState(emptyState.active)

  // Reset the form during render whenever the modal (re)opens for a
  // different commission, instead of in an effect.
  const formKey = open ? `${mode}:${commission?.id ?? 'new'}` : null
  const [syncedKey, setSyncedKey] = useState(formKey)
  if (formKey !== syncedKey) {
    setSyncedKey(formKey)
    if (open) {
      if (mode === 'edit' && commission) {
        setName(commission.name)
        setPercentage(commission.percentage)
        setActive(commission.active)
      } else {
        setName(emptyState.name)
        setPercentage(emptyState.percentage)
        setActive(emptyState.active)
      }
    }
  }

  const submit = () => {
    if (!name.trim()) return message.warning('Commission name is required.')
    if (percentage === undefined || percentage < 0 || percentage > 100)
      return message.warning('Percentage must be between 0 and 100.')

    if (mode === 'create') {
      createCommission({
        type: 'standard',
        name: name.trim(),
        description: '',
        percentage,
        active,
      })
      message.success('Commission created.')
    } else if (commission) {
      updateCommission(commission.id, {
        name: name.trim(),
        percentage,
        active,
      })
      message.success('Commission updated.')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create commission' : `Edit ${commission?.name}`}
      okText={mode === 'create' ? 'Create' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      width={500}
      destroyOnClose
    >
      <div className="space-y-5">
        <Field label="Commission name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Standard, Express, Premium"
          />
        </Field>

        <Field label="Commission percentage (%)">
          <InputNumber
            value={percentage}
            onChange={(val) => setPercentage(val ?? 0)}
            min={0}
            max={100}
            step={0.1}
            style={{ width: '100%' }}
            placeholder="e.g. 5"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Admin will take this percentage from each transaction
          </p>
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated p-3">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Status
            </label>
            <p className="text-xs text-gray-500">
              {active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <Switch checked={active} onChange={setActive} />
        </div>
      </div>
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
