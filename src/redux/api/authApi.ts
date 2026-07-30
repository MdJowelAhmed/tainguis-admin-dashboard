import { baseApi } from '../baseApi'
import { setCredentials, clearCredentials } from '../slice/authSlice'
import type { AuthUser } from '../slice/authSlice'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse<T = undefined> {
  success: boolean
  message: string
  data?: T
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailPayload {
  email: string
  oneTimeCode: number
}

export interface ResetPasswordPayload {
  newPassword: string
  confirmPassword: string
}

export interface UpdateMyProfilePayload {
  name?: string
  phone?: string
  profileImage?: File | null
}

type LoginResponseData = { accessToken: string; role: string }
type VerifyEmailResponseData = { token: string } | string
type ProfileData = AuthUser & {
  _id: string
  isDeleted: boolean
  isPhoneVerified: boolean
  authProviders: string[]
  createdAt: string
  updatedAt: string
  __v: number
  admin?: {
    _id?: string
    permissions?: string[]
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Login ────────────────────────────────────────────────────────────────
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const token = data?.data?.accessToken
          const role = data?.data?.role
          if (token) {
            // Reset old query cache to prevent stale user data cross-contamination
            dispatch(baseApi.util.resetApiState())
            // Store token in redux (redux-persist will sync to localStorage)
            dispatch(setCredentials({ token, role }))
          }
        } catch {
          // error handled by RTK Query; component reads `isError`
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // ── Register ─────────────────────────────────────────────────────────────
    register: builder.mutation<ApiResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // ── Logout ───────────────────────────────────────────────────────────────
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          // Clear credentials and completely purge RTK Query cache memory
          dispatch(clearCredentials())
          dispatch(baseApi.util.resetApiState())
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // ── Get Current User ─────────────────────────────────────────────────────
    getCurrentUser: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({ url: '/auth/current-user', method: 'GET' }),
      providesTags: ['Auth'],
    }),

    // ── Change Password ──────────────────────────────────────────────────────
    changePassword: builder.mutation<ApiResponse, ChangePasswordPayload>({
      query: (credentials) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: credentials,
      }),
    }),

    // ── Forgot Password ──────────────────────────────────────────────────────
    forgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (credentials) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body: credentials,
      }),
    }),

    // ── Resend OTP ───────────────────────────────────────────────────────────
    resendOtp: builder.mutation<ApiResponse, { email: string }>({
      query: (credentials) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: credentials,
      }),
    }),

    // ── Verify Email ─────────────────────────────────────────────────────────
    // Stores the reset token received from backend into localStorage for use
    // in the subsequent reset-password call.
    verifyEmail: builder.mutation<ApiResponse<VerifyEmailResponseData>, VerifyEmailPayload>({
      query: (credentials) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const resData = data?.data as any
          const token =
            typeof resData === 'string'
              ? resData
              : resData?.token || resData?.accessToken
          if (token && typeof token === 'string') {
            localStorage.setItem('resetPasswordToken', token)
          }
        } catch {
          // RTK Query handles the error; component reads `isError`
        }
      },
    }),

    // ── Reset Password ───────────────────────────────────────────────────────
    resetPassword: builder.mutation<ApiResponse, ResetPasswordPayload>({
      query: (credentials) => {
        const resetToken = localStorage.getItem('resetPasswordToken')
        return {
          url: '/auth/reset-password',
          method: 'POST',
          body: credentials,
          headers: resetToken ? { Authorization: resetToken } : {},
        }
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled
          // Cleanup: remove one-time-use token
          localStorage.removeItem('resetPasswordToken')
        } catch {
          // leave token in place so user can retry
        }
      },
    }),

    // ── Get My Profile ───────────────────────────────────────────────────────
    getMyProfile: builder.query<ApiResponse<ProfileData>, void>({
      query: () => ({ url: '/users/profile', method: 'GET' }),
      providesTags: ['Users'],
    }),

    // ── Update My Profile ────────────────────────────────────────────────────
    updateMyProfile: builder.mutation<ApiResponse<ProfileData>, UpdateMyProfilePayload>({
      query: ({ name, phone, profileImage }) => {
        const formData = new FormData()
        if (name) formData.append('name', name)
        if (phone !== undefined) formData.append('phone', phone)
        if (profileImage) formData.append('profileImage', profileImage)
        return {
          url: '/users/profile',
          method: 'PATCH',
          body: formData,
        }
      },
      invalidatesTags: ['Users'],
    }),

  }),
  overrideExisting: false,
})

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useGetMyProfileQuery,
  useGetMyProfileQuery: useGetProfileQuery,
  useUpdateMyProfileMutation,
  useUpdateMyProfileMutation: useUpdateProfileMutation,
} = authApi