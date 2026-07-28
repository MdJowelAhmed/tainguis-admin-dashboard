import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { baseApi } from './baseApi'
import authReducer from './slice/authSlice'

// ─── Custom Storage ───────────────────────────────────────────────────────────
// redux-persist/lib/storage default export doesn't resolve correctly with
// Vite's ESM bundler. This custom wrapper uses the native localStorage API
// directly and is the most reliable cross-bundler solution.

const localStorageEngine = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItem: (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string): Promise<void> => {
    localStorage.removeItem(key)
    return Promise.resolve()
  },
}

// ─── Persist Config ───────────────────────────────────────────────────────────
// Only persist the auth slice. RTK Query cache (baseApi) is intentionally
// NOT persisted — it should always be fresh on page reload.

const authPersistConfig = {
  key: 'auth',
  version: 1,
  storage: localStorageEngine,
  whitelist: ['token', 'user', 'isAuthenticated', 'role'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistedAuthReducer,
})

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required: ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

export const persistor = persistStore(store)

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
