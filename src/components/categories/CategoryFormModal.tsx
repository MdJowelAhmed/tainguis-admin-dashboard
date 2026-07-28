import { useEffect, useState } from 'react'
import { App, Input, Modal, Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { RcFile, UploadFile } from 'antd/es/upload'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { createCategory, updateCategory } from './categoriesStore'
import type { Category, Subcategory } from './categoriesData'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  category?: Category | null
  onClose: () => void
}

type DraftSub = Subcategory & { isNew?: boolean }

const emptyState = {
  name: '',
  image: '',
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
  })

export default function CategoryFormModal({
  open,
  mode,
  category,
  onClose,
}: Props) {
  const { message } = App.useApp()
  const [name, setName] = useState(emptyState.name)
  const [image, setImage] = useState(emptyState.image)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [subcategories, setSubcategories] = useState<DraftSub[]>([])
  const [newSubName, setNewSubName] = useState('')
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editingSubName, setEditingSubName] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && category) {
      setName(category.name)
      setImage(category.image || '')
      setFileList(
        category.image
          ? [
              {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: category.image,
              },
            ]
          : [],
      )
      setSubcategories(category.subcategories.map((s) => ({ ...s })))
    } else {
      setName(emptyState.name)
      setImage(emptyState.image)
      setFileList([])
      setSubcategories([])
    }
    setNewSubName('')
    setEditingSubId(null)
    setEditingSubName('')
  }, [open, mode, category])

  const handleImageChange = async (file: RcFile) => {
    const base64 = await getBase64(file)
    setImage(base64)
    setFileList([
      {
        uid: '-1',
        name: file.name,
        status: 'done',
        url: base64,
      },
    ])
    return false
  }

  const addSub = () => {
    const trimmed = newSubName.trim()
    if (!trimmed) return
    const tempId = `tmp_${Date.now()}`
    setSubcategories((prev) => [...prev, { id: tempId, name: trimmed, isNew: true }])
    setNewSubName('')
  }

  const beginEditSub = (s: DraftSub) => {
    setEditingSubId(s.id)
    setEditingSubName(s.name)
  }

  const saveEditSub = () => {
    if (!editingSubId) return
    const trimmed = editingSubName.trim()
    if (!trimmed) {
      setEditingSubId(null)
      return
    }
    setSubcategories((prev) =>
      prev.map((s) => (s.id === editingSubId ? { ...s, name: trimmed } : s)),
    )
    setEditingSubId(null)
    setEditingSubName('')
  }

  const removeSub = (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id))
    if (editingSubId === id) setEditingSubId(null)
  }

  const submit = () => {
    if (!name.trim()) return message.warning('Category name is required.')

    const cleanedSubs: Subcategory[] = subcategories.map((s) => ({
      id: s.isNew ? '' : s.id,
      name: s.name,
    }))

    if (mode === 'create') {
      createCategory({
        name: name.trim(),
        description: '',
        image: image || undefined,
        status: 'active',
        productsCount: 0,
        subcategories: cleanedSubs,
      })
      message.success('Category created.')
    } else if (category) {
      const finalSubs: Subcategory[] = subcategories.map((s, i) =>
        s.isNew
          ? {
              id: `sub_${category.id.replace('cat_', '')}_${Date.now()}_${i}`,
              name: s.name,
            }
          : { id: s.id, name: s.name },
      )
      updateCategory(category.id, {
        name: name.trim(),
        image: image || undefined,
        subcategories: finalSubs,
      })
      message.success('Category updated.')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create category' : `Edit ${category?.name}`}
      okText={mode === 'create' ? 'Create category' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      width={560}
      destroyOnHidden
    >
      <div className="space-y-5">
        <Field label="Category name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vegetables, Fruits, Dairy"
          />
        </Field>

        <Field label="Category image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={handleImageChange}
            onRemove={() => {
              setImage('')
              setFileList([])
            }}
            maxCount={1}
          >
            {fileList.length < 1 && (
              <div>
                <PlusOutlined />
                <div className="mt-2 text-xs">Upload Image</div>
              </div>
            )}
          </Upload>
        </Field>

        <Field label={`Subcategories (${subcategories.length})`}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onPressEnter={addSub}
                placeholder="Add subcategory name"
              />
              <button
                type="button"
                onClick={addSub}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-hover"
              >
                Add
              </button>
            </div>

            {subcategories.length === 0 ? (
              <p className="text-xs text-gray-500">
                No subcategories yet. Add one above.
              </p>
            ) : (
              <ul className="divide-y divide-surface-border rounded-md border border-surface-border">
                {subcategories.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    {editingSubId === s.id ? (
                      <>
                        <Input
                          autoFocus
                          size="small"
                          value={editingSubName}
                          onChange={(e) => setEditingSubName(e.target.value)}
                          onPressEnter={saveEditSub}
                        />
                        <button
                          type="button"
                          onClick={saveEditSub}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-green-600 hover:bg-green-50"
                          aria-label="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSubId(null)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-50"
                          aria-label="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 truncate text-gray-900">
                          {s.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => beginEditSub(s)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          aria-label="Edit subcategory"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSub(s.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-red-500 hover:bg-red-50"
                          aria-label="Delete subcategory"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
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
