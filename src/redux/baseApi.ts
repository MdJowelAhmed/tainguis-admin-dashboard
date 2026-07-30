import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { RootState } from './store'
import { clearCredentials } from './slice/authSlice'

// ─── Env Guard ────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('[baseApi] VITE_API_BASE_URL is not defined. Check your .env.local file.')
}

// ─── Raw Base Query ───────────────────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (!headers.has('Authorization') && token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    // NOTE: Do NOT set Content-Type manually.
    // For FormData requests the browser must set it with the multipart boundary.
    return headers
  },
})

// ─── Base Query with Auto-Logout on 401 ───────────────────────────────────────
// If any request returns a 401 Unauthorized, clear auth state immediately.
// This handles expired tokens without needing to check in every component.

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // Token expired / invalid — force logout and purge cache
    api.dispatch(clearCredentials())
    api.dispatch(baseApi.util.resetApiState())
  }

  return result
}

// ─── Base API ─────────────────────────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Users',
    'User',
    'LiveShow',
    'Dashboard',
    'Order',
    'Report',
    'Controller',
    'Category',
    'Commission',
    'Broadcast',
    'Support',
    'Revenue',
    // Add more tag types here as you create new API slices
  ],
  endpoints: () => ({}),
})