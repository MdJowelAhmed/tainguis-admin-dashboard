import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { App, Dropdown, Select, Table, Tooltip, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import SearchInput from '../../components/ui/SearchInput'
import {
  useGetAllControllerQuery,
  useDeleteControllerMutation,
} from '../../redux/api/controllerApi'
import type { AdminAccountItem, GetAdminsParams } from '../../redux/api/controllerApi'
import {
  permissionLabels,
  roleLabels,
  type AdminPermission,
  type AdminRole,
} from '../../components/admins/adminsData'
import AdminFormModal from '../../components/admins/AdminFormModal'
import { imageUrl } from '../../lib/imageUrl'

const roleStyles: Record<string, string> = {
  super_admin: 'bg-brand/10 text-brand ring-brand/20',
  manager: 'bg-blue-100 text-blue-700 ring-blue-200',
  support: 'bg-green-100 text-green-700 ring-green-200',
  custom: 'bg-amber-100 text-amber-700 ring-amber-200',
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  suspended: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export default function Admins() {
  const { modal, message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('searchTerm') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const roleFilter = searchParams.get('role') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminAccountItem | null>(null)

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === 'all') {
          next.delete(k)
        } else {
          next.set(k, v)
        }
      })
      return next
    })
  }

  // ── Queries ────────────────────────────────────────────────────────────────
  const queryParams: GetAdminsParams = {
    page,
    limit: pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
  }

  const { data: adminsRes, isLoading, isError, error } = useGetAllControllerQuery(queryParams)
  const [deleteController, { isLoading: isDeleting }] = useDeleteControllerMutation()

  const admins = adminsRes?.data ?? []
  const pagination = adminsRes?.pagination

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (a: AdminAccountItem) => {
    setEditing(a)
    setModalOpen(true)
  }

  const remove = (a: AdminAccountItem) => {
    if (a.role === 'super_admin') {
      message.warning('Super Admin cannot be deleted.')
      return
    }
    modal.confirm({
      title: `Delete ${a.user?.name ?? 'Admin'}?`,
      content: 'This admin account will be removed permanently.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteController(a._id).unwrap()
          message.success(`${a.user?.name ?? 'Admin'} deleted.`)
        } catch {
          message.error('Failed to delete admin.')
        }
      },
    })
  }

  const columns: ColumnsType<AdminAccountItem> = [
    {
      title: 'Admin',
      key: 'admin',
      render: (_, a) => {
        const name = a.user?.name ?? 'Admin'
        const email = a.user?.email ?? ''
        const profileImage = a.user?.profileImage

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-gray-700">
              {profileImage ? (
                <img
                  src={imageUrl(profileImage)}
                  alt={name}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">
                {name}
              </div>
              <div className="truncate text-xs text-gray-500">{email}</div>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, a) => {
        const style = roleStyles[a.role] || 'bg-gray-100 text-gray-700 ring-gray-200'
        const label = roleLabels[a.role as AdminRole] || a.role
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${style}`}
          >
            {label}
          </span>
        )
      },
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, a) => {
        const perms = (a.permissions ?? []) as AdminPermission[]
        const shown = perms.slice(0, 3)
        const extra = perms.length - shown.length
        const full = perms.map((p) => permissionLabels[p] || p).join(', ')
        return (
          <Tooltip title={full}>
            <div className="flex flex-wrap gap-1.5">
              {shown.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700 capitalize"
                >
                  {permissionLabels[p] || p.replace(/_/g, ' ')}
                </span>
              ))}
              {extra > 0 && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  +{extra} more
                </span>
              )}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, a) => {
        const style = statusStyles[a.status] || 'bg-gray-100 text-gray-700 ring-gray-200'
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                a.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {a.status === 'active' ? 'Active' : 'Suspended'}
          </span>
        )
      },
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (_, a) => (
        <span className="text-xs text-gray-500">
          {new Date(a.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, a) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <Pencil size={14} />,
                label: 'Edit',
                onClick: () => openEdit(a),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: <span className="text-red-600">Delete</span>,
                onClick: () => remove(a),
                disabled: a.role === 'super_admin',
              },
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="Admin actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ]

  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load admin accounts.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create staff accounts with page-level permissions so your team can
            use the panel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} />
          Add admin
        </button>
      </header>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <SearchInput
            value={search}
            onChange={(val) => updateParams({ searchTerm: val, page: null })}
            placeholder="Search by name, email, or phone"
            maxWidth={320}
          />
          <Select
            value={roleFilter}
            onChange={(val) => updateParams({ role: val, page: null })}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All roles' },
              ...(Object.keys(roleLabels) as AdminRole[]).map((r) => ({
                value: r,
                label: roleLabels[r],
              })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateParams({ status: val, page: null })}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            {pagination ? `${pagination.total} total admins` : ''}
          </span>
        </div>

        <Spin spinning={isLoading || isDeleting}>
          <Table<AdminAccountItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={admins}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => updateParams({ page: String(p) }),
            }}
          />
        </Spin>
      </section>

      <AdminFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        admin={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
