import { useEffect, useState } from 'react'
import { App, Input, Modal, Upload, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { RcFile, UploadFile } from 'antd/es/upload'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../redux/api/categoriesApi'
import type { CategoryListItem } from '../../redux/api/categoriesApi'
import { imageUrl } from '../../lib/imageUrl'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  category?: CategoryListItem | null
  onClose: () => void
}

type DraftSub = {
  id: string
  name: string
  isNew?: boolean
}

const emptyState = {
  name: '',
  image: '',
}

export default function CategoryFormModal({
  open,
  mode,
  category,
  onClose,
}: Props) {
  const { message } = App.useApp()

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

  const [name, setName] = useState(emptyState.name)
  const [imagePreview, setImagePreview] = useState(emptyState.image)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [subcategories, setSubcategories] = useState<DraftSub[]>([])
  const [newSubName, setNewSubName] = useState('')
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editingSubName, setEditingSubName] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && category) {
      setName(category.name)
      setImagePreview(category.image ? imageUrl(category.image) : '')
      setSelectedFile(null)
      setFileList(
        category.image
          ? [
              {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: imageUrl(category.image),
              },
            ]
          : [],
      )
      const existingSubs = (category.subCategories || category.subcategories || []).map((s) => ({
        id: s._id,
        name: s.name,
      }))
      setSubcategories(existingSubs)
    } else {
      setName(emptyState.name)
      setImagePreview(emptyState.image)
      setSelectedFile(null)
      setFileList([])
      setSubcategories([])
    }
    setNewSubName('')
    setEditingSubId(null)
    setEditingSubName('')
  }, [open, mode, category])

  const handleBeforeUpload = (file: RcFile) => {
    setSelectedFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setFileList([
      {
        uid: file.uid || String(Date.now()),
        name: file.name,
        status: 'done',
        url: previewUrl,
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

  const submit = async () => {
    if (!name.trim()) return message.warning('Category name is required.')

    const formData = new FormData()
    formData.append('name', name.trim())

    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    const subNames = subcategories.map((s) => s.name.trim()).filter(Boolean)
    formData.append('subCategories', JSON.stringify(subNames))

    try {
      if (mode === 'create') {
        await createCategory(formData).unwrap()
        message.success('Category created.')
      } else if (category) {
        await updateCategory({ id: category._id, formData }).unwrap()
        message.success('Category updated.')
      }
      onClose()
    } catch (err: any) {
      const errMsg = err?.data?.message ?? 'Failed to save category.'
      message.error(errMsg)
    }
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create category' : `Edit ${category?.name}`}
      okText={mode === 'create' ? 'Create category' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      confirmLoading={isCreating || isUpdating}
      width={560}
      destroyOnClose
    >
      <Spin spinning={isCreating || isUpdating}>
        <div className="space-y-5 py-2">
          <Field label="Category name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Phone, Gaming, Electronics"
            />
          </Field>

          <Field label="Category image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onRemove={() => {
                setImagePreview('')
                setSelectedFile(null)
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
                  placeholder="Add subcategory name (e.g. iPhone, Samsung)"
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
      <div className="mt-1">{children}</div>
    </div>
  )
}
