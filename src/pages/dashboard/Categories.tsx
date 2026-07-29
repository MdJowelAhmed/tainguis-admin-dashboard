import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { App, Dropdown, Input, Select, Table, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Check,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../../redux/api/categoriesApi'
import type { CategoryListItem, SubCategoryItem, GetCategoriesParams } from '../../redux/api/categoriesApi'
import CategoryFormModal from '../../components/categories/CategoryFormModal'
import { imageUrl } from '../../lib/imageUrl'

type StatusFilter = 'all' | 'active' | 'inactive'

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  inactive: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export default function Categories() {
  const { modal, message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('searchTerm') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryListItem | null>(null)

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
  const queryParams: GetCategoriesParams = {
    page,
    limit: pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { data: categoriesRes, isLoading, isError, error } = useGetAllCategoriesQuery(queryParams)
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

  const categories = categoriesRes?.data ?? []
  const pagination = categoriesRes?.pagination

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (c: CategoryListItem) => {
    setEditing(c)
    setModalOpen(true)
  }

  const remove = (c: CategoryListItem) => {
    modal.confirm({
      title: `Delete ${c.name}?`,
      content: 'This category will be removed permanently.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCategory(c._id).unwrap()
          message.success(`${c.name} deleted.`)
        } catch {
          message.error('Failed to delete category.')
        }
      },
    })
  }

  const columns: ColumnsType<CategoryListItem> = [
    {
      title: 'Category',
      key: 'category',
      render: (_, c) => {
        const subs = c.subCategories || c.subcategories || []
        return (
          <div className="flex items-center gap-3">
            <CategoryImage category={c} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900 capitalize">
                {c.name}
              </div>
              <div className="truncate text-xs text-gray-500">
                {subs.length} subcategories
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <span className="text-sm text-gray-700">{slug}</span>
      ),
    },
    {
      title: 'Products',
      key: 'products',
      align: 'right' as const,
      render: (_, c) => (
        <span className="text-sm font-medium text-gray-900">
          {c.productCount ?? c.productsCount ?? 0}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, c) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            statusStyles[c.status] || 'bg-gray-100 text-gray-700 ring-gray-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {c.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-sm text-gray-700">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right' as const,
      width: 60,
      render: (_, c) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <Pencil size={14} />,
                label: 'Edit',
                onClick: () => openEdit(c),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: <span className="text-red-600">Delete</span>,
                onClick: () => remove(c),
              },
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="Category actions"
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
      'Failed to load categories.'
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
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and organize your inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} />
          Add category
        </button>
      </header>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => updateParams({ searchTerm: e.target.value, page: null })}
            placeholder="Search by name, slug, or subcategory"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[360px]"
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateParams({ status: val, page: null })}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            {pagination ? `${pagination.total} total categories` : ''}
          </span>
        </div>

        <Spin spinning={isLoading || isDeleting}>
          <Table<CategoryListItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={categories}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => updateParams({ page: String(p) }),
            }}
            expandable={{
              expandedRowRender: (c) => <SubcategoryPanel category={c} />,
              rowExpandable: () => true,
            }}
          />
        </Spin>
      </section>

      <CategoryFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        category={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function CategoryImage({ category }: { category: CategoryListItem }) {
  const [errored, setErrored] = useState(false)
  if (!category.image || errored) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-elevated text-lg">
        📦
      </div>
    )
  }
  return (
    <img
      src={imageUrl(category.image)}
      alt={category.name}
      className="h-10 w-10 rounded object-cover"
      onError={() => setErrored(true)}
    />
  )
}

function SubcategoryPanel({ category }: { category: CategoryListItem }) {
  const { message } = App.useApp()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

  const subs = category.subCategories || category.subcategories || []

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const submitNew = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    const updatedSubNames = [...subs.map((s) => s.name), trimmed]

    const formData = new FormData()
    formData.append('name', category.name)
    formData.append('subCategories', JSON.stringify(updatedSubNames))

    try {
      await updateCategory({ id: category._id, formData }).unwrap()
      setNewName('')
      message.success('Subcategory added.')
    } catch {
      message.error('Failed to add subcategory.')
    }
  }

  const beginEdit = (s: SubCategoryItem) => {
    setEditingId(s._id)
    setEditingName(s.name)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }

    const updatedSubNames = subs.map((s) => (s._id === editingId ? trimmed : s.name))

    const formData = new FormData()
    formData.append('name', category.name)
    formData.append('subCategories', JSON.stringify(updatedSubNames))

    try {
      await updateCategory({ id: category._id, formData }).unwrap()
      setEditingId(null)
      setEditingName('')
      message.success('Subcategory updated.')
    } catch {
      message.error('Failed to update subcategory.')
    }
  }

  const removeSub = async (subId: string) => {
    const updatedSubNames = subs.filter((s) => s._id !== subId).map((s) => s.name)

    const formData = new FormData()
    formData.append('name', category.name)
    formData.append('subCategories', JSON.stringify(updatedSubNames))

    try {
      await updateCategory({ id: category._id, formData }).unwrap()
      message.success('Subcategory deleted.')
    } catch {
      message.error('Failed to delete subcategory.')
    }
  }

  return (
    <Spin spinning={isUpdating}>
      <div className="space-y-3 px-2 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={submitNew}
            placeholder={`Add subcategory to ${category.name}`}
            className="max-w-[320px]"
            size="small"
          />
          <button
            type="button"
            onClick={submitNew}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-hover"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {subs.length === 0 ? (
          <p className="text-xs text-gray-500">No subcategories yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {subs.map((s) => (
              <li
                key={s._id}
                className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs"
              >
                {editingId === s._id ? (
                  <>
                    <Input
                      size="small"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onPressEnter={saveEdit}
                      style={{ width: 140 }}
                    />
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-green-600 hover:bg-green-50"
                      aria-label="Save"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
                      aria-label="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <button
                      type="button"
                      onClick={() => beginEdit(s)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      aria-label="Edit subcategory"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSub(s._id)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-50"
                      aria-label="Delete subcategory"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Spin>
  )
}
