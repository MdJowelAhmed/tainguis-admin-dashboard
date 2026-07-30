import { baseApi } from '../baseApi'
import type { RootState } from '../store'
import { getSocket } from '../../socket/socket'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface NotificationItem {
  _id: string
  type: string
  title: string
  message: string
  receiver: string
  referenceId?: string
  isRead: boolean
  channels?: string[]
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface PaginationInfo {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface GetNotificationsResponse {
  success: boolean
  message: string
  pagination?: PaginationInfo
  data: {
    notifications: NotificationItem[]
    unreadCount: number
  }
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
}

// ─── API Slice ────────────────────────────────────────────────────────────────

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query<GetNotificationsResponse, GetNotificationsParams | void>({
      query: (params) => ({
        url: '/notifications/me',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch, getState }
      ) {
        try {
          await cacheDataLoaded
          const state = getState() as RootState
          const token = state?.auth?.token || localStorage.getItem('token') || undefined
          const socket = getSocket(token)

          const handleGetNotification = (data: any) => {
            console.log('🔔 Socket getNotification received:', data)

            // If data is a new notification object, update cache optimistically
            if (data) {
              updateCachedData((draft) => {
                if (draft?.data?.notifications) {
                  const newNotif: NotificationItem = data.notification || data
                  if (newNotif && newNotif._id) {
                    const exists = draft.data.notifications.some((n) => n._id === newNotif._id)
                    if (!exists) {
                      draft.data.notifications.unshift(newNotif)
                      draft.data.unreadCount = (draft.data.unreadCount || 0) + 1
                      if (draft.pagination) {
                        draft.pagination.total += 1
                      }
                    }
                  }
                }
              })
            }

            // Invalidate tags to fetch the latest list from backend
            dispatch(notificationApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]))
          }

          socket.on('getNotification', handleGetNotification)

          await cacheEntryRemoved
          socket.off('getNotification', handleGetNotification)
        } catch (err) {
          console.error('Error in socket getNotification listener:', err)
        }
      },
    }),

    readAllNotifications: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    readSingleNotification: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    deleteNotification: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadSingleNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi