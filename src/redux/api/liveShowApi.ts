import { baseApi } from '../baseApi'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LiveShowStatus = 'live' | 'scheduled' | 'completed' | 'cancelled'
export type LiveShowFormat = 'auction' | 'live'

export interface CategoryInfo {
  _id: string
  name: string
}

export interface SellerInfo {
  _id: string
  name: string
  profileImage: string
}

export interface LiveShowListItem {
  _id: string
  title: string
  thumbnail: string
  status: LiveShowStatus
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  totalHearts: number
  totalViews: number
  activeViewers: number
  categoryInfo: CategoryInfo
  sellerInfo: SellerInfo
  totalSales: number
  soldItemsCount: number
  listingsCount: number
  totalStock: number
  format: LiveShowFormat
}

export interface LiveProduct {
  _id: string
  show: string
  product: {
    _id: string
    stock: number
    salesFormat: string
    bidStartFrom?: number
  }
  status: string
  createdAt: string
  updatedAt: string
  soldCount: number
  revenue: number
}

export interface LiveShowDetail {
  show: {
    _id: string
    seller: {
      _id: string
      name: string
      email: string
      phone: string
      profileImage: string
      address: string
    }
    title: string
    category: CategoryInfo
    thumbnail: string
    freeShipping: boolean
    status: LiveShowStatus
    scheduledAt: string
    startedAt?: string
    endedAt?: string
    totalHearts: number
    totalViews: number
    streamProvider: string
    createdAt: string
    updatedAt: string
    activeViewers: number
  }
  liveProducts: LiveProduct[]
  bids: {
    totalBidders: number
    currentBid: number
  }
  chat: {
    chatRoomId: string | null
  }
  sellerStats: {
    totalShows: number
    totalProducts: number
    totalOrders: number
  }
}

export interface GetLiveShowsParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: LiveShowStatus | string
  format?: LiveShowFormat | string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface ChatMessageSender {
  _id: string
  name: string
  profileImage: string
}

export interface ChatMessage {
  _id: string
  chat: string
  sender: ChatMessageSender
  text: string
  image: string
  type: string
  seenBy: string[]
  createdAt: string
  isMe: boolean
  isSeen: boolean
}

interface GetLiveShowsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: LiveShowListItem[]
}

interface GetLiveShowByIdResponse {
  success: boolean
  message: string
  data: LiveShowDetail
}

export interface GetLiveChatMessagesResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: ChatMessage[]
}

interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Live Show API ────────────────────────────────────────────────────────────

const liveShowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Get All Live Shows ───────────────────────────────────────────────────
    getAllLiveShows: builder.query<GetLiveShowsResponse, GetLiveShowsParams | void>({
      query: (params) => ({
        url: '/admin-dashboard/shows',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'LiveShow' as const, id: _id })),
              { type: 'LiveShow', id: 'LIST' },
            ]
          : [{ type: 'LiveShow', id: 'LIST' }],
    }),

    // ── Get Single Live Show ─────────────────────────────────────────────────
    getLiveShowById: builder.query<GetLiveShowByIdResponse, string>({
      query: (id) => ({
        url: `/admin-dashboard/shows/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'LiveShow', id }],
    }),

    // ── End a Live Show ──────────────────────────────────────────────────────
    endLiveShow: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/admin-dashboard/shows/${id}/end`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'LiveShow', id },
        { type: 'LiveShow', id: 'LIST' },
      ],
    }), 

    getLiveInChattingMessage: builder.query<GetLiveChatMessagesResponse, string>({
      query: (id) => ({
        url: `/messages/chats/${id}/`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'LiveShow', id }],
    }),

  }),
  overrideExisting: false,
})

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  useGetAllLiveShowsQuery,
  useGetLiveShowByIdQuery,
  useEndLiveShowMutation,
  useGetLiveInChattingMessageQuery,
} = liveShowApi
