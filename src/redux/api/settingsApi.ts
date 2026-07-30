import { baseApi } from '../baseApi'

export interface DisclaimerData {
  _id: string
  type: 'privacy-policy' | 'terms-and-conditions' | string
  content: string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface DisclaimerResponse {
  success: boolean
  message: string
  data: DisclaimerData
}

export interface UpdateDisclaimerPayload {
  type: 'privacy-policy' | 'terms-and-conditions' | string
  content: string
}

export interface FaqItem {
  _id: string
  question: string
  answer: string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface GetFaqsResponse {
  success: boolean
  message: string
  pagination?: {
    total: number
    limit: number
    page: number
    totalPage: number
  }
  data: FaqItem[]
}

export interface SingleFaqResponse {
  success: boolean
  message: string
  data: FaqItem
}

export interface CreateFaqPayload {
  question: string
  answer: string
}

export interface UpdateFaqArgs {
  id: string
  question: string
  answer: string
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query<DisclaimerResponse, void>({
      query: () => ({
        url: '/disclaimers/terms-and-conditions',
        method: 'GET',
      }),
      providesTags: [{ type: 'Controller', id: 'TERMS' }],
    }),

    getPrivacyPolicy: builder.query<DisclaimerResponse, void>({
      query: () => ({
        url: '/disclaimers/privacy-policy',
        method: 'GET',
      }),
      providesTags: [{ type: 'Controller', id: 'PRIVACY' }],
    }),

    updateDisclaimer: builder.mutation<DisclaimerResponse, UpdateDisclaimerPayload>({
      query: (body) => ({
        url: '/disclaimers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Controller', id: 'TERMS' },
        { type: 'Controller', id: 'PRIVACY' },
        { type: 'Controller', id: 'LIST' },
      ],
    }),

    getAllFAQ: builder.query<GetFaqsResponse, void>({
      query: () => ({
        url: '/faqs',
        method: 'GET',
      }),
      providesTags: [{ type: 'Controller', id: 'FAQ' }],
    }),

    createFAQ: builder.mutation<SingleFaqResponse, CreateFaqPayload>({
      query: (body) => ({
        url: '/faqs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Controller', id: 'FAQ' }],
    }),

    updateFAQ: builder.mutation<SingleFaqResponse, UpdateFaqArgs>({
      query: ({ id, ...body }) => ({
        url: `/faqs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Controller', id: 'FAQ' }],
    }),

    deleteFAQ: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Controller', id: 'FAQ' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTermsAndConditionsQuery,
  useGetPrivacyPolicyQuery,
  useUpdateDisclaimerMutation,
  useGetAllFAQQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} = settingsApi

export const useUpdateTermsAndConditionsMutation = useUpdateDisclaimerMutation