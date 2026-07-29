import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface DashboardSummaryData {
  totalRevenue: number
  totalOrders: number
  activeUsers: number
  liveShows: number
}

export interface DashboardSummaryResponse {
  success: boolean
  message: string
  data: DashboardSummaryData
}

export interface GetEarningsParams {
  year?: string | number
  month?: string | number
}

export interface EarningsDataItem {
  year: number
  month: number
  label: string
  revenue: number
}

export interface EarningsResponse {
  success: boolean
  message: string
  data: EarningsDataItem[]
}

export interface OrderBuyer {
  _id: string
  name: string
  email: string
  profileImage?: string
}

export interface OrderItemApi {
  product: string
  quantity: number
  price: number
  _id: string
}

export interface ShippingAddressApi {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  _id: string
}

export interface RecentOrderItem {
  _id: string
  orderId: string
  buyer: OrderBuyer
  seller: string
  items: OrderItemApi[]
  shippingAddress: ShippingAddressApi
  shippingCost: number
  tax: number
  subtotal: number
  total: number
  platformFee: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  updatedAt: string
  transaction?: string
  carrier?: string
  trackingNumber?: string
}

export interface RecentOrdersResponse {
  success: boolean
  message: string
  pagination?: {
    total: number
    limit: number
    page: number
    totalPage: number
  }
  data: RecentOrderItem[]
}

export interface CategoryInfo {
  _id: string
  name: string
}

export interface SellerInfo {
  _id: string
  name: string
  profileImage?: string
}

export interface LiveShowListItem {
  _id: string
  title: string
  thumbnail: string
  status: string
  scheduledAt: string
  startedAt?: string
  totalHearts: number
  totalViews: number
  categoryInfo: CategoryInfo
  sellerInfo: SellerInfo
  totalSales: number
  soldItemsCount: number
  listingsCount: number
  totalStock: number
  format: 'auction' | 'live' | string
  activeViewers: number
}

export interface LiveShowsResponse {
  success: boolean
  message: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPage: number
  }
  data: LiveShowListItem[]
}

export interface SupportUser {
  _id: string
  name: string
  email?: string
  profileImage?: string
}

export interface SupportTicketItem {
  _id: string
  ticketId: string
  title: string
  description: string
  user: SupportUser
  category: string
  priority: string
  chat?: string
  status: string
  assignedTo?: SupportUser
}

export interface SupportTicketsResponse {
  success: boolean
  message: string
  pagination?: {
    total: number
    limit: number
    page: number
    totalPage: number
  }
  data: SupportTicketItem[]
}

export interface ReportedUser {
  _id: string
  name: string
  email?: string
  profileImage?: string
}

export interface PendingReportItem {
  _id: string
  reporter: ReportedUser
  reportedUser: ReportedUser
  reason: string
  description: string
  reportCode: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PendingReportsResponse {
  success: boolean
  message: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPage: number
  }
  data: PendingReportItem[]
}

// ─── Overview API Endpoints ───────────────────────────────────────────────────

const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query<DashboardSummaryData, void>({
      query: () => ({
        url: '/admin-dashboard/overview/stats',
        method: 'GET',
      }),
      transformResponse: (response: DashboardSummaryResponse) => response.data,
      providesTags: ['Dashboard'],
    }),

    getRevenueByMonths: builder.query<EarningsDataItem[], GetEarningsParams | void>({
      query: (args) => {
        const queryParams = new URLSearchParams()
        if (args?.year) queryParams.append('year', String(args.year))
        if (args?.month) queryParams.append('month', String(args.month))
        const queryString = queryParams.toString()
        return {
          url: `/admin-dashboard/revenues/revenue-by-month${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
      transformResponse: (response: EarningsResponse) => response.data,
      providesTags: ['Dashboard'],
    }),

    getRecentOrders: builder.query<RecentOrderItem[], number | { limit?: number } | void>({
      query: (arg) => {
        const limit = typeof arg === 'number' ? arg : arg?.limit
        const params: Record<string, string | number> = {}
        if (limit) params.limit = limit
        return {
          url: `/admin-dashboard/orders/`,
          method: 'GET',
          params,
        }
      },
      transformResponse: (response: RecentOrdersResponse) => response.data,
      providesTags: ['Dashboard'],
    }),

    getRecentlyLiveShows: builder.query<LiveShowListItem[], number | { limit?: number } | void>({
      query: (arg) => {
        const limit = typeof arg === 'number' ? arg : arg?.limit
        const params: Record<string, string | number> = { status: 'live' }
        if (limit) params.limit = limit
        return {
          url: `/admin-dashboard/shows`,
          method: 'GET',
          params,
        }
      },
      transformResponse: (response: LiveShowsResponse) => response.data,
      providesTags: ['Dashboard'],
    }),

    getRecentSupportedTickets: builder.query<SupportTicketItem[], number | { limit?: number } | void>({
      query: (arg) => {
        const limit = typeof arg === 'number' ? arg : (arg?.limit ?? 5)
        return {
          url: `/support-tickets`,
          method: 'GET',
          params: { limit },
        }
      },
      transformResponse: (response: SupportTicketsResponse) => response.data,
      providesTags: ['Dashboard'],
    }),

    getRecentPendingReports: builder.query<PendingReportItem[], number | { limit?: number } | void>({
      query: (arg) => {
        const limit = typeof arg === 'number' ? arg : (arg?.limit ?? 5)
        return {
          url: `/reports/`,
          method: 'GET',
          params: { status: 'pending', limit },
        }
      },
      transformResponse: (response: PendingReportsResponse) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetOverviewStatsQuery,
  useGetRevenueByMonthsQuery,
  useGetRecentOrdersQuery,
  useGetRecentlyLiveShowsQuery,
  useGetRecentSupportedTicketsQuery,
  useGetRecentPendingReportsQuery,
} = overviewApi