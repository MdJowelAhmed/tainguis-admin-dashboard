import { useSyncExternalStore } from 'react'
import {
  initialCategories,
  type Category,
  type Subcategory,
} from './categoriesData'

let categories: Category[] = initialCategories
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return categories
}

function nextId() {
  const used = categories
    .map((c) => parseInt(c.id.replace('cat_', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `cat_${String(max + 1).padStart(3, '0')}`
}

function nextSubId(categoryId: string, existing: Subcategory[]) {
  const prefix = `sub_${categoryId.replace('cat_', '')}_`
  const used = existing
    .map((s) => parseInt(s.id.replace(prefix, ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `${prefix}${max + 1}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function useCategories(): Category[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useCategory(id: string | undefined): Category | undefined {
  const all = useCategories()
  return id ? all.find((c) => c.id === id) : undefined
}

export function createCategory(
  input: Omit<Category, 'id' | 'createdAt' | 'slug' | 'subcategories'> & {
    slug?: string
    subcategories?: Subcategory[]
  },
) {
  const id = nextId()
  const subcategories = (input.subcategories || []).map((s, i) => ({
    id: s.id || `sub_${id.replace('cat_', '')}_${i + 1}`,
    name: s.name,
  }))
  const entry: Category = {
    id,
    slug: input.slug || generateSlug(input.name),
    createdAt: today(),
    name: input.name,
    description: input.description,
    image: input.image,
    productsCount: input.productsCount,
    status: input.status,
    subcategories,
  }
  categories = [entry, ...categories]
  emit()
  return entry
}

export function updateCategory(id: string, patch: Partial<Category>) {
  categories = categories.map((c) =>
    c.id === id
      ? {
          ...c,
          ...patch,
          slug: patch.name ? generateSlug(patch.name) : c.slug,
        }
      : c,
  )
  emit()
}

export function deleteCategory(id: string) {
  categories = categories.filter((c) => c.id !== id)
  emit()
}

export function addSubcategory(categoryId: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  categories = categories.map((c) => {
    if (c.id !== categoryId) return c
    return {
      ...c,
      subcategories: [
        ...c.subcategories,
        { id: nextSubId(c.id, c.subcategories), name: trimmed },
      ],
    }
  })
  emit()
}

export function updateSubcategory(
  categoryId: string,
  subId: string,
  name: string,
) {
  const trimmed = name.trim()
  if (!trimmed) return
  categories = categories.map((c) => {
    if (c.id !== categoryId) return c
    return {
      ...c,
      subcategories: c.subcategories.map((s) =>
        s.id === subId ? { ...s, name: trimmed } : s,
      ),
    }
  })
  emit()
}

export function deleteSubcategory(categoryId: string, subId: string) {
  categories = categories.map((c) => {
    if (c.id !== categoryId) return c
    return {
      ...c,
      subcategories: c.subcategories.filter((s) => s.id !== subId),
    }
  })
  emit()
}
