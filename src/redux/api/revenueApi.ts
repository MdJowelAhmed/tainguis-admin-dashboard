import { baseApi } from '../baseApi'

export interface RevenueItem {
  _id: string
  product: string
  quantity: number
  price: number
}

export interface RevenueBuyer {
  _id: string
  name: string
}

export interface RevenueTransaction {
  _id: string
  orderId: string
  buyer: RevenueBuyer
  items: RevenueItem[]
  platformFee: number
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetTransactionsParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface GetTransactionsResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: RevenueTransaction[]
}

const revenueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransactions: builder.query<GetTransactionsResponse, GetTransactionsParams | void>({
      query: (params) => ({
        url: '/admin-dashboard/revenues/revenue-transactions',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Revenue' as const, id: _id })),
              { type: 'Revenue', id: 'LIST' },
            ]
          : [{ type: 'Revenue', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAllTransactionsQuery } = revenueApi