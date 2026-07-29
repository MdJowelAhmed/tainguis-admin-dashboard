import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type ReportActionTaken = 'dismiss' | 'warning' | 'blocked' | 'inactive'

export interface ResolveReportPayload {
  actionTaken: ReportActionTaken
  adminNote: string
}

export interface ReportUserRef {
  _id: string
  name: string
  email?: string
  profileImage?: string
}

export interface ReportListItem {
  _id: string
  reporter?: ReportUserRef
  reportedUser?: ReportUserRef
  reason: string
  description: string
  reportCode?: string
  status: 'pending' | 'dismissed' | 'actioned' | string
  createdAt: string
  updatedAt: string
  action?: string
  actionTaken?: ReportActionTaken | string
  adminNote?: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface ReportHistoryItem {
  _id: string
  reason: string
  reportCode?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetReportsParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  reason?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetReportsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: ReportListItem[]
}

export interface SingleReportResponse {
  success: boolean
  message: string
  data: ReportListItem
}

export interface ReportsHistoryResponse {
  success: boolean
  message: string
  pagination?: PaginationMeta
  data: ReportHistoryItem[]
}

export interface UpdateReportStatusPayload {
  id: string
  status: string
  action?: string
  adminNote?: string
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Report API Endpoints ─────────────────────────────────────────────────────

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReports: builder.query<GetReportsResponse, GetReportsParams | void>({
      query: (params) => ({
        url: '/reports',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Report' as const, id: _id })),
              { type: 'Report', id: 'LIST' },
            ]
          : [{ type: 'Report', id: 'LIST' }],
    }),

    getReportById: builder.query<SingleReportResponse, string>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Report', id }],
    }),

    getReportsHistory: builder.query<ReportsHistoryResponse, string>({
      query: (id) => ({
        url: `/reports/${id}/user-reports-history`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Report', id: `HISTORY_${id}` }],
    }),

    updateReportStatus: builder.mutation<ApiResponse, UpdateReportStatusPayload>({
      query: ({ id, ...body }) => ({
        url: `/reports/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
        { type: 'Dashboard' },
      ],
    }),

    reportResolve: builder.mutation<ApiResponse, { id: string; data: ResolveReportPayload }>({
      query: ({ id, data }) => ({
        url: `/reports/${id}/resolve`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
        { type: 'Dashboard' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllReportsQuery,
  useGetReportByIdQuery,
  useGetReportsHistoryQuery,
  useUpdateReportStatusMutation,
  useReportResolveMutation,
} = reportApi
