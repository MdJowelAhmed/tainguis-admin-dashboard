import { isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import { message } from 'antd'
import { extractErrorMessage } from '../../utils/errorUtils'

/**
 * Global RTK Query error middleware.
 * Intercepts all failed API mutations and queries across the app
 * and automatically displays a clean Ant Design error message toast.
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action: any) => {
  if (isRejectedWithValue(action)) {
    // Check if component requested suppressed auto-toasts
    const suppressToast = action.meta?.arg?.originalArgs?.suppressGlobalError

    if (!suppressToast) {
      const errMsg = extractErrorMessage(action.payload)
      message.error(errMsg)
    }
  }

  return next(action)
}
