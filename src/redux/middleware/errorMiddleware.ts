import { isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import { message } from 'antd'
import { extractErrorMessage } from '../../utils/errorUtils'
import type { RootState } from '../store'

/**
 * Global RTK Query error middleware.
 * Intercepts failed API mutations and queries across the app
 * and displays clean Ant Design error message toasts while suppressing
 * irrelevant error toasts during logout or unauthenticated states.
 */
export const rtkQueryErrorLogger: Middleware = (api) => (next) => (action: any) => {
  if (isRejectedWithValue(action)) {
    const state = api.getState() as RootState
    const token = state.auth?.token

    // Suppress toasts if component requested or if user is logged out (or logging out)
    const suppressToast = action.meta?.arg?.originalArgs?.suppressGlobalError
    const isUnauthenticatedError = !token && (action.payload?.status === 401 || action.payload?.status === 404)

    if (!suppressToast && !isUnauthenticatedError) {
      const errMsg = extractErrorMessage(action.payload)
      if (
        errMsg &&
        !errMsg.includes("API DOESN'T EXIST") &&
        !errMsg.toLowerCase().includes('not authorized')
      ) {
        message.error(errMsg)
      }
    }
  }

  return next(action)
}
