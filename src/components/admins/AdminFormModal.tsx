import { useEffect, useMemo, useState } from 'react'
import { App, Checkbox, Input, Modal, Select } from 'antd'
import {
  allPermissions,
  permissionDescriptions,
  permissionLabels,
  rolePresets,
  roleLabels,
  type AdminAccount,
  type AdminPermission,
  type AdminRole,
} from './adminsData'
import { createAdmin, updateAdmin } from './adminsStore'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  admin?: AdminAccount | null
  onClose: () => void
}

const emptyState = {
  name: '',
  email: '',
  phone: '',
  role: 'manager' as AdminRole,
  permissions: rolePresets.manager,
  password: '',
}

function arraysEqual(a: AdminPermission[], b: AdminPermission[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((x) => set.has(x))
}

function matchRole(perms: AdminPermission[]): AdminRole {
  for (const role of ['super_admin', 'manager', 'support'] as AdminRole[]) {
    if (arraysEqual(perms, rolePresets[role])) return role
  }
  return 'custom'
}

export default function AdminFormModal({
  open,
  mode,
  admin,
  onClose,
}: Props) {
  const { message } = App.useApp()
  const [name, setName] = useState(emptyState.name)
  const [email, setEmail] = useState(emptyState.email)
  const [phone, setPhone] = useState(emptyState.phone)
  const [role, setRole] = useState<AdminRole>(emptyState.role)
  const [permissions, setPermissions] = useState<AdminPermission[]>(
    emptyState.permissions,
  )
  const [password, setPassword] = useState(emptyState.password)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && admin) {
      setName(admin.name)
      setEmail(admin.email)
      setPhone(admin.phone ?? '')
      setRole(admin.role)
      setPermissions(admin.permissions)
      setPassword('')
    } else {
      setName(emptyState.name)
      setEmail(emptyState.email)
      setPhone(emptyState.phone)
      setRole(emptyState.role)
      setPermissions(rolePresets.manager)
      setPassword('')
    }
  }, [open, mode, admin])

  const onRoleChange = (next: AdminRole) => {
    setRole(next)
    if (next !== 'custom') {
      setPermissions(rolePresets[next])
    }
  }

  const togglePermission = (p: AdminPermission) => {
    setPermissions((prev) => {
      const has = prev.includes(p)
      const next = has ? prev.filter((x) => x !== p) : [...prev, p]
      return next
    })
  }

  const effectiveRole = useMemo(() => matchRole(permissions), [permissions])
  useEffect(() => {
    if (effectiveRole !== role) setRole(effectiveRole)
  }, [effectiveRole, role])

  const submit = () => {
    if (!name.trim()) return message.warning('Name is required.')
    if (!email.trim()) return message.warning('Email is required.')
    if (!email.includes('@')) return message.warning('Enter a valid email.')
    if (permissions.length === 0)
      return message.warning('Select at least one page permission.')
    if (mode === 'create' && password.length < 8)
      return message.warning('Password must be at least 8 characters.')

    if (mode === 'create') {
      createAdmin({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        permissions,
      })
      message.success('Admin account created.')
    } else if (admin) {
      updateAdmin(admin.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        permissions,
      })
      message.success('Admin updated.')
    }
    onClose()
  }

  const isSuper = mode === 'edit' && admin?.role === 'super_admin'

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create admin account' : `Edit ${admin?.name}`}
      okText={mode === 'create' ? 'Create account' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      width={680}
      destroyOnClose
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Renata Salinas"
            />
          </Field>
          <Field label="Phone (optional)">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +52 55 1234 5678"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@tianguislive.com"
            />
          </Field>
          {mode === 'create' && (
            <Field label="Temporary password">
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </Field>
          )}
        </div>

        <Field label="Role">
          <Select
            value={role}
            onChange={onRoleChange}
            disabled={isSuper}
            style={{ width: '100%' }}
            options={(Object.keys(roleLabels) as AdminRole[]).map((r) => ({
              value: r,
              label: roleLabels[r],
            }))}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Picking a role pre-fills the page permissions below. Adjusting them
            switches the role to “Custom”.
          </p>
        </Field>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900">
              Page permissions
            </label>
            <span className="text-xs text-gray-500">
              {permissions.length} of {allPermissions.length} selected
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {allPermissions.map((p) => {
              const checked = permissions.includes(p)
              const disabled = isSuper
              return (
                <label
                  key={p}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                    checked
                      ? 'border-brand bg-brand/5'
                      : 'border-surface-border bg-white hover:border-gray-300'
                  } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onChange={() => togglePermission(p)}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {permissionLabels[p]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {permissionDescriptions[p]}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
          {isSuper && (
            <p className="mt-3 text-xs text-amber-700">
              Super Admin always has full access. Change the role to edit
              permissions.
            </p>
          )}
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
      <div className="mt-2">{children}</div>
    </div>
  )
}
