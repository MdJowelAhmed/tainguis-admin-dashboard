import { useMemo, useState } from 'react'
import { App, Dropdown, Input, Select, Table } from 'antd'
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
  addSubcategory,
  deleteCategory,
  deleteSubcategory,
  updateSubcategory,
  useCategories,
} from '../../components/categories/categoriesStore'
import type {
  Category,
  Subcategory,
} from '../../components/categories/categoriesData'
import CategoryFormModal from '../../components/categories/CategoryFormModal'

type StatusFilter = 'all' | 'active' | 'inactive'

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  inactive: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export default function Categories() {
  const categories = useCategories()
  const { modal, message } = App.useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return categories.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.subcategories.some((s) => s.name.toLowerCase().includes(q))
      )
    })
  }, [categories, search, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setModalOpen(true)
  }

  const remove = (c: Category) => {
    modal.confirm({
      title: `Delete ${c.name}?`,
      content: 'This category will be removed permanently.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteCategory(c.id)
        message.success(`${c.name} deleted.`)
      },
    })
  }

  const removeSub = (c: Category, s: Subcategory) => {
    modal.confirm({
      title: `Delete ${s.name}?`,
      content: `Remove this subcategory from ${c.name}.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteSubcategory(c.id, s.id)
        message.success('Subcategory deleted.')
      },
    })
  }

  const columns: ColumnsType<Category> = [
    {
      title: 'Category',
      key: 'category',
      render: (_, c) => (
        <div className="flex items-center gap-3">
          <CategoryImage category={c} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              {c.name}
            </div>
            <div className="truncate text-xs text-gray-500">
              {c.subcategories.length} subcategories
            </div>
          </div>
        </div>
      ),
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
          {c.productsCount}
        </span>
      ),
      sorter: (a, b) => a.productsCount - b.productsCount,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, c) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[c.status]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {c.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, c) => c.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-sm text-gray-700">{date}</span>
      ),
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description, slug, or subcategory"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[360px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {categories.length}
          </span>
        </div>

        <Table<Category>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          expandable={{
            expandedRowRender: (c) => (
              <SubcategoryPanel category={c} onDelete={removeSub} />
            ),
            rowExpandable: () => true,
          }}
        />
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

function CategoryImage({ category }: { category: Category }) {
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
      src={category.image}
      alt={category.name}
      className="h-10 w-10 rounded object-cover"
      onError={() => setErrored(true)}
    />
  )
}

function SubcategoryPanel({
  category,
  onDelete,
}: {
  category: Category
  onDelete: (c: Category, s: Subcategory) => void
}) {
  const { message } = App.useApp()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const submitNew = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    addSubcategory(category.id, trimmed)
    setNewName('')
    message.success('Subcategory added.')
  }

  const beginEdit = (s: Subcategory) => {
    setEditingId(s.id)
    setEditingName(s.name)
  }

  const saveEdit = () => {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    updateSubcategory(category.id, editingId, trimmed)
    setEditingId(null)
    setEditingName('')
    message.success('Subcategory updated.')
  }

  return (
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

      {category.subcategories.length === 0 ? (
        <p className="text-xs text-gray-500">No subcategories yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {category.subcategories.map((s) => (
            <li
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs"
            >
              {editingId === s.id ? (
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
                    onClick={() => onDelete(category, s)}
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
  )
}
