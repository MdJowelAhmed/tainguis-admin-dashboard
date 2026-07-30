import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_customer'
  | 'resolved'
  | 'closed'

export type SupportTicketPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface SupportUserRef {
  _id: string
  name: string
  email?: string
  profileImage?: string
  phone?: string
}

export interface SupportTicketItem {
  _id: string
  ticketId: string
  title: string
  description: string
  user: SupportUserRef
  category: string
  priority: SupportTicketPriority
  chat: string
  status: SupportTicketStatus
  assignedTo?: string | { _id: string; name: string }
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetSupportTicketsParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  priority?: string
  category?: string
}

export interface GetSupportTicketsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: SupportTicketItem[]
}

export interface SingleSupportTicketResponse {
  success: boolean
  message: string
  data: SupportTicketItem
}

export interface UpdateSupportPayload {
  status?: SupportTicketStatus
  priority?: SupportTicketPriority
  assignedTo?: string
}

export interface UpdateSupportArgs {
  id: string
  data: UpdateSupportPayload
}

export interface MessageSenderRef {
  _id: string
  name: string
  profileImage?: string
  role?: string
}

export interface SupportMessageItem {
  _id: string
  chat: string
  sender: MessageSenderRef
  text: string
  image?: string
  type: string
  seenBy?: string[]
  createdAt?: string
  isMe?: boolean
  isSeen?: boolean
}

export interface GetMessagesResponse {
  success: boolean
  message: string
  pagination?: PaginationMeta
  data: SupportMessageItem[]
}

export interface SendMessagePayload {
  chat: string
  type: string
  text: string
  image?: string
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Support API Endpoints ────────────────────────────────────────────────────

const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSupportTicket: builder.query<GetSupportTicketsResponse, GetSupportTicketsParams | void>({
      query: (params) => ({
        url: '/support-tickets',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Support' as const, id: _id })),
              { type: 'Support', id: 'LIST' },
            ]
          : [{ type: 'Support', id: 'LIST' }],
    }),

    getSupportTicketById: builder.query<SingleSupportTicketResponse, string>({
      query: (id) => ({
        url: `/support-tickets/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Support', id }],
    }),

    updateSupport: builder.mutation<ApiResponse<SupportTicketItem>, UpdateSupportArgs>({
      query: ({ id, data }) => ({
        url: `/support-tickets/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Support', id },
        { type: 'Support', id: 'LIST' },
      ],
    }),

    getSupportMessage: builder.query<GetMessagesResponse, string>({
      query: (id) => ({
        url: `/messages/chats/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Support', id: `MESSAGE_${id}` }],
    }),

    sendSupportMessage: builder.mutation<ApiResponse<SupportMessageItem>, SendMessagePayload>({
      query: (body) => ({
        url: `/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { chat }) => [
        { type: 'Support', id: `MESSAGE_${chat}` },
        { type: 'Support', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllSupportTicketQuery,
  useGetSupportTicketByIdQuery,
  useUpdateSupportMutation,
  useGetSupportMessageQuery,
  useSendSupportMessageMutation,
} = supportApi