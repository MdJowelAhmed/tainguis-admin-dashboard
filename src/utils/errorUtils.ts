/**
 * Safely extracts human-readable error message from backend responses,
 * RTK Query error objects, or JavaScript Error instances.
 */
export function extractErrorMessage(errorPayload: any): string {
  if (!errorPayload) return 'An unexpected error occurred.'

  if (typeof errorPayload === 'string') return errorPayload

  const data = errorPayload?.data || errorPayload

  // 1. Array of error messages (e.g. Zod / backend validation errors)
  if (
    data?.errorMessages &&
    Array.isArray(data.errorMessages) &&
    data.errorMessages.length > 0
  ) {
    const firstErr = data.errorMessages[0]
    return firstErr?.message || firstErr?.path || 'Validation error occurred.'
  }

  // 2. Direct message string
  if (data?.message && typeof data.message === 'string') {
    return data.message
  }

  // 3. Error field string
  if (data?.error && typeof data.error === 'string') {
    return data.error
  }

  // 4. Standard JS Error instance
  if (errorPayload instanceof Error) {
    return errorPayload.message
  }

  // 5. Network / HTTP Status Code Fallbacks
  if (errorPayload?.status === 'FETCH_ERROR') {
    return 'Network error. Please check your internet connection.'
  }

  if (errorPayload?.status === 'PARSING_ERROR') {
    return 'Failed to parse response from the server.'
  }

  if (errorPayload?.status === 401) {
    return 'Session expired. Please log in again.'
  }

  if (errorPayload?.status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (errorPayload?.status === 404) {
    return 'Requested resource was not found.'
  }

  if (typeof errorPayload?.status === 'number' && errorPayload.status >= 500) {
    return 'Server error occurred. Please try again later.'
  }

  return 'Something went wrong. Please try again.'
}
