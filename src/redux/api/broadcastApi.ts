import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface BroadcastListItem {
  _id: string
  code?: string
  type: string
  audience: string
  title: string
  message: string
  channels: string[]
  status: 'sent' | 'scheduled' | 'draft' | string
  totalRecipients?: number
  readCount?: number
  sentBy?: string
  createdAt: string
  updatedAt: string
  sentAt?: string
  scheduledAt?: string
  readRate?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetBroadcastsParams {
  page?: number
  limit?: number
  searchTerm?: string
  type?: string
  status?: string
}

export interface GetBroadcastsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: BroadcastListItem[]
}

export interface SendBroadcastPayload {
  type: string
  title: string
  message: string
  audience: string
  channels: string[]
  scheduledAt?: string
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Broadcast API Endpoints ──────────────────────────────────────────────────

const broadcastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBroadcasts: builder.query<GetBroadcastsResponse, GetBroadcastsParams | void>({
      query: (params) => ({
        url: '/broadcasts',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Broadcast' as const, id: _id })),
              { type: 'Broadcast', id: 'LIST' },
            ]
          : [{ type: 'Broadcast', id: 'LIST' }],
    }),

    sendBroadcast: builder.mutation<ApiResponse<BroadcastListItem>, SendBroadcastPayload>({
      query: (body) => ({
        url: '/broadcasts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Broadcast', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllBroadcastsQuery,
  useSendBroadcastMutation,
} = broadcastApi