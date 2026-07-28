import { baseApi } from '../baseApi'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'inactive'

export interface UserListItem {
  _id: string
  name: string
  role: string
  email: string
  phone: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalSpent: number
}

export interface UserDetail {
  _id: string
  name: string
  role: string
  email: string
  phone: string
  profileImage: string
  address: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  orderHistory: unknown[]
  mostOrderedProducts: unknown[]
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderDate: string | null
}

export interface GetUsersParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: UserStatus | string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

interface GetUsersResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: UserListItem[]
}

interface GetUserByIdResponse {
  success: boolean
  message: string
  data: UserDetail
}

interface UpdateUserStatusPayload {
  id: string
  status: UserStatus
}

interface UpdateUserStatusResponse {
  success: boolean
  message: string
}

// ─── User API ─────────────────────────────────────────────────────────────────

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Get All Users ────────────────────────────────────────────────────────
    getUsers: builder.query<GetUsersResponse, GetUsersParams | void>({
      query: (params) => ({
        url: '/admin-dashboard/users',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // ── Get Single User ──────────────────────────────────────────────────────
    getUserById: builder.query<GetUserByIdResponse, string>({
      query: (id) => ({
        url: `/admin-dashboard/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // ── Update User Status ───────────────────────────────────────────────────
    updateUserStatus: builder.mutation<UpdateUserStatusResponse, UpdateUserStatusPayload>({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/users/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      // Invalidate the specific user + list so both refetch automatically
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

  }),
  overrideExisting: false,
})

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
} = userApi
