import { useEffect, useMemo, useState } from 'react'
import { App, Checkbox, Input, Modal, Select, Spin } from 'antd'
import {
  allPermissions,
  permissionDescriptions,
  permissionLabels,
  rolePresets,
  roleLabels,
  type AdminPermission,
  type AdminRole,
} from './adminsData'
import {
  useCreateControllerMutation,
  useUpdateControllerMutation,
} from '../../redux/api/controllerApi'
import type { AdminAccountItem } from '../../redux/api/controllerApi'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  admin?: AdminAccountItem | null
  onClose: () => void
}

const selectablePermissions = allPermissions.filter(
  (p) => p !== 'dashboard_overview',
)

const emptyState = {
  name: '',
  email: '',
  role: 'custom' as AdminRole,
  permissions: ['user_management'] as AdminPermission[],
  password: '',
}

function arraysEqual(a: AdminPermission[], b: AdminPermission[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((x) => set.has(x))
}

function matchRole(perms: AdminPermission[]): AdminRole {
  for (const role of ['admin', 'manager', 'support_agent'] as AdminRole[]) {
    if (rolePresets[role] && arraysEqual(perms, rolePresets[role])) return role
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
  const [createController, { isLoading: isCreating }] = useCreateControllerMutation()
  const [updateController, { isLoading: isUpdating }] = useUpdateControllerMutation()

  const [name, setName] = useState(emptyState.name)
  const [email, setEmail] = useState(emptyState.email)
  const [role, setRole] = useState<AdminRole>(emptyState.role)
  const [permissions, setPermissions] = useState<AdminPermission[]>(
    emptyState.permissions,
  )
  const [password, setPassword] = useState(emptyState.password)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && admin) {
      setName(admin.user?.name ?? '')
      setEmail(admin.user?.email ?? '')
      const r = (admin.role as AdminRole) === 'support' ? 'support_agent' : (admin.role as AdminRole) || 'custom'
      setRole(r)
      setPermissions((admin.permissions as AdminPermission[]) ?? [])
      setPassword('')
    } else {
      setName(emptyState.name)
      setEmail(emptyState.email)
      setRole(emptyState.role)
      setPermissions(emptyState.permissions)
      setPassword('')
    }
  }, [open, mode, admin])

  const onRoleChange = (next: AdminRole) => {
    setRole(next)
    if (next !== 'custom' && rolePresets[next]) {
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

  const submit = async () => {
    if (!name.trim()) return message.warning('Name is required.')
    if (!email.trim()) return message.warning('Email is required.')
    if (!email.includes('@')) return message.warning('Enter a valid email.')
    if (permissions.length === 0)
      return message.warning('Select at least one page permission.')
    if (mode === 'create' && password.length > 0 && password.length < 6)
      return message.warning('Password must be at least 6 characters.')

    const sendRole = role === 'support' ? 'support_agent' : role

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role: sendRole,
      permissions,
      ...(password.trim() ? { password: password.trim() } : {}),
    }

    try {
      if (mode === 'create') {
        await createController(payload).unwrap()
        message.success('Admin account created.')
      } else if (admin) {
        await updateController({ id: admin._id, data: payload }).unwrap()
        message.success('Admin updated.')
      }
      onClose()
    } catch (err: any) {
      const errMsg = err?.data?.message ?? 'Failed to save admin account.'
      message.error(errMsg)
    }
  }

  const isSuper = mode === 'edit' && admin?.role === 'super_admin'

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create admin account' : `Edit ${admin?.user?.name ?? 'Admin'}`}
      okText={mode === 'create' ? 'Create account' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      confirmLoading={isCreating || isUpdating}
      width={680}
      destroyOnClose
    >
      <Spin spinning={isCreating || isUpdating}>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mr Nur"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@meikeya.com"
              />
            </Field>
            <Field label={mode === 'create' ? 'Password' : 'Password (optional)'}>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'create' ? 'At least 6 characters' : 'Leave blank to keep unchanged'}
              />
            </Field>
            <Field label="Role">
              <Select
                value={role}
                onChange={onRoleChange}
                disabled={isSuper}
                style={{ width: '100%' }}
                options={(Object.keys(roleLabels) as AdminRole[])
                  .filter((r) => r !== 'support' && r !== 'super_admin')
                  .map((r) => ({
                    value: r,
                    label: roleLabels[r],
                  }))}
              />
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900">
                Page permissions
              </label>
              <span className="text-xs text-gray-500">
                {permissions.length} of {selectablePermissions.length} selected
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {selectablePermissions.map((p) => {
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
          </div>
        </div>
      </Spin>
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
