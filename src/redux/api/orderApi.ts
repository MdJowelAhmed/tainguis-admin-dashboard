import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface OrderBuyer {
  _id: string
  name: string
  email: string
  profileImage?: string
  phone?: string
}

export interface OrderItemProductDetail {
  _id: string
  title?: string
  name?: string
  images?: string[]
  thumbnail?: string
  image?: string
}

export interface OrderItemProduct {
  product: string | OrderItemProductDetail
  quantity: number
  price: number
  _id: string
  name?: string
  image?: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  _id?: string
}

export interface OrderListItem {
  _id: string
  orderId: string
  buyer: OrderBuyer
  seller: string
  items: OrderItemProduct[]
  shippingAddress: ShippingAddress | string
  shippingCost: number
  tax: number
  subtotal: number
  total: number
  platformFee?: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  updatedAt: string
  transaction?: string
  carrier?: string
  trackingNumber?: string
  notes?: string
  shippingFee?: number
  discount?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetOrdersParams {
  page?: number
  limit?: number
  searchTerm?: string
  orderStatus?: string
  paymentStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetOrdersResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: OrderListItem[]
}

export interface SingleOrderResponse {
  success: boolean
  message: string
  data: OrderListItem
}

export interface OrderStatsData {
  totalOrders: number
  revenue: number
  inFulfillment: number
  avgOrderValue: number
}

export interface OrderStatsResponse {
  success: boolean
  message: string
  data: OrderStatsData
}

export interface UpdateOrderStatusPayload {
  id: string
  orderStatus: string
}

export interface UpdatePaymentStatusPayload {
  id: string
  paymentStatus: string
}

export interface UpdateTrackingPayload {
  id: string
  carrier?: string
  trackingNumber: string
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Order API Endpoints ──────────────────────────────────────────────────────

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query<GetOrdersResponse, GetOrdersParams | void>({
      query: (params) => ({
        url: '/admin-dashboard/orders',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Order' as const, id: _id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getOrderStats: builder.query<OrderStatsResponse, void>({
      query: () => ({
        url: '/admin-dashboard/orders/stats',
        method: 'GET',
      }),
      providesTags: [{ type: 'Order', id: 'STATS' }],
    }),

    getOrderById: builder.query<SingleOrderResponse, string>({
      query: (id) => ({
        url: `/admin-dashboard/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    updateOrderStatus: builder.mutation<ApiResponse, UpdateOrderStatusPayload>({
      query: ({ id, orderStatus }) => ({
        url: `/admin-dashboard/orders/${id}/status`,
        method: 'PATCH',
        body: { orderStatus },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'STATS' },
      ],
    }),

    updateOrderPaymentStatus: builder.mutation<ApiResponse, UpdatePaymentStatusPayload>({
      query: ({ id, paymentStatus }) => ({
        url: `/admin-dashboard/orders/${id}/payment-status`,
        method: 'PATCH',
        body: { paymentStatus },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'STATS' },
      ],
    }),

    updateOrderTracking: builder.mutation<ApiResponse, UpdateTrackingPayload>({
      query: ({ id, carrier, trackingNumber }) => ({
        url: `/admin-dashboard/orders/${id}/tracking`,
        method: 'PATCH',
        body: { carrier, trackingNumber },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllOrdersQuery,
  useGetOrderStatsQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
  useUpdateOrderTrackingMutation,
} = orderApi

export const useGetAllOrderQuery = useGetAllOrdersQuery
