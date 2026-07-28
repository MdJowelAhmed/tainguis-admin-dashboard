import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  profileImage?: string
  status: string
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  role: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

// ─── Initial State ────────────────────────────────────────────────────────────
// NOTE: token is loaded from localStorage here; persistence is also handled
// by redux-persist in store.ts (dual-layer safety).

const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  passwordResetEmail: null,
  verificationEmail: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after a successful login/register API response */
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; role?: string; user?: AuthUser }>,
    ) => {
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
      if (action.payload.role) {
        state.role = action.payload.role
      }
      if (action.payload.user) {
        state.user = action.payload.user
      }
    },

    /** Clear all auth state (logout) */
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.role = null
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
      state.passwordResetEmail = null
      state.verificationEmail = null
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    clearError: (state) => {
      state.error = null
    },

    /** Store the email used during forgot-password flow */
    setPasswordResetEmail: (state, action: PayloadAction<string>) => {
      state.passwordResetEmail = action.payload
    },

    /** Store email used during OTP verification flow */
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
    },
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  clearError,
  setPasswordResetEmail,
  setVerificationEmail,
} = authSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectAuthError = (state: RootState) => state.auth.error
export const selectPasswordResetEmail = (state: RootState) => state.auth.passwordResetEmail
export const selectVerificationEmail = (state: RootState) => state.auth.verificationEmail

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default authSlice.reducer
