import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface CommissionSettingsData {
  _id: string
  commissionPercentage: number
  isCommissionActive: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface GetCommissionResponse {
  success: boolean
  message: string
  data: CommissionSettingsData
}

export interface UpdateCommissionPayload {
  commissionPercentage?: number
  isCommissionActive?: boolean
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Commission API Endpoints ──────────────────────────────────────────────────

const commissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommission: builder.query<GetCommissionResponse, void>({
      query: () => ({
        url: '/admin-settings',
        method: 'GET',
      }),
      providesTags: [{ type: 'Commission', id: 'SETTINGS' }],
    }),

    updateCommission: builder.mutation<ApiResponse<CommissionSettingsData>, UpdateCommissionPayload>({
      query: (body) => ({
        url: '/admin-settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Commission', id: 'SETTINGS' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCommissionQuery,
  useUpdateCommissionMutation,
} = commissionApi