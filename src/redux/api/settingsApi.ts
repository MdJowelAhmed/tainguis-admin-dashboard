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
  }),
  overrideExisting: false,
})

export const {
  useGetTermsAndConditionsQuery,
  useGetPrivacyPolicyQuery,
  useUpdateDisclaimerMutation,
} = settingsApi

export const useUpdateTermsAndConditionsMutation = useUpdateDisclaimerMutation