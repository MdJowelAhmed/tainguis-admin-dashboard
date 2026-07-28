import { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  /** Current value (controlled — usually from URL param) */
  value: string
  /** Called after debounce delay with the new search term */
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  maxWidth?: number | string
}

/**
 * Reusable search input with built-in debounce.
 *
 * Usage:
 *   <SearchInput
 *     value={searchParams.get('searchTerm') ?? ''}
 *     onChange={(val) => updateParams({ searchTerm: val, page: null })}
 *     placeholder="Search users…"
 *   />
 *
 * - Shows the typed value immediately (local state) for instant feedback.
 * - Fires `onChange` only after `debounceMs` (default 400ms) of idle time.
 * - Syncs back when the external `value` prop changes (e.g. URL changes).
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 400,
  className = '',
  maxWidth = 320,
}: SearchInputProps) {
  // Local state for instant visual feedback while the user types
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local value when external value changes (e.g. URL cleared externally)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setLocalValue(newVal)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      onChange(newVal)
    }, debounceMs)
  }

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocalValue('')
    onChange('')
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<Search size={16} className="text-gray-400" />}
      suffix={
        localValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null
      }
      style={{ maxWidth }}
      className={className}
    />
  )
}
