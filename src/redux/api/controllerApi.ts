import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type AdminPermissionKey =
  | 'dashboard_overview'
  | 'user_management'
  | 'business_management'
  | 'categories'
  | 'payments'
  | 'settings'
  | 'support'
  | 'promotions'
  | 'events_management'

export interface ControllerUserRef {
  _id: string
  name: string
  email: string
  profileImage?: string
  status?: string
}

export interface AdminAccountItem {
  _id: string
  user: ControllerUserRef
  role: string
  permissions: AdminPermissionKey[] | string[]
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

export interface GetAdminsParams {
  page?: number
  limit?: number
  searchTerm?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetAdminsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: AdminAccountItem[]
}

export interface SingleAdminResponse {
  success: boolean
  message: string
  data: AdminAccountItem
}

export interface CreateControllerPayload {
  name: string
  email: string
  role: string
  password?: string
  permissions: string[]
}

export interface UpdateControllerPayload {
  name?: string
  email?: string
  role?: string
  password?: string
  permissions?: string[]
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Controller API Endpoints ──────────────────────────────────────────────────

const controllerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllController: builder.query<GetAdminsResponse, GetAdminsParams | void>({
      query: (params) => ({
        url: '/admin',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Controller' as const, id: _id })),
              { type: 'Controller', id: 'LIST' },
            ]
          : [{ type: 'Controller', id: 'LIST' }],
    }),

    getControllerById: builder.query<SingleAdminResponse, string>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Controller', id }],
    }),

    createController: builder.mutation<ApiResponse, CreateControllerPayload>({
      query: (data) => ({
        url: '/admin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Controller', id: 'LIST' }],
    }),

    updateController: builder.mutation<ApiResponse, { id: string; data: UpdateControllerPayload }>({
      query: ({ id, data }) => ({
        url: `/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Controller', id },
        { type: 'Controller', id: 'LIST' },
      ],
    }),

    deleteController: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Controller', id },
        { type: 'Controller', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllControllerQuery,
  useGetControllerByIdQuery,
  useCreateControllerMutation,
  useUpdateControllerMutation,
  useDeleteControllerMutation,
} = controllerApi