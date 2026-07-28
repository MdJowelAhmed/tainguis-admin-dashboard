import { useDispatch, useSelector, useStore } from 'react-redux'
import type { RootState, AppDispatch, AppStore } from './store'

// ─── Typed Hooks ──────────────────────────────────────────────────────────────
// Use these throughout the app instead of plain `useDispatch` / `useSelector`
// to get full TypeScript inference without repeating the generic type each time.

/**
 * Typed version of `useDispatch`.
 * Aware of async thunks (e.g. RTK Query mutations).
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Typed version of `useSelector`.
 * Automatically infers state shape from RootState.
 */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector)

/**
 * Typed version of `useStore`.
 * Useful when you need direct store access (rare — prefer hooks above).
 */
export const useAppStore = () => useStore<AppStore>()
