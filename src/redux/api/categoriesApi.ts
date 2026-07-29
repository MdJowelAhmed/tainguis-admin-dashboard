import { baseApi } from '../baseApi'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface SubCategoryItem {
  _id: string
  name: string
  parent?: string | null
  status?: string
  slug?: string
  createdAt?: string
  updatedAt?: string
}

export interface CategoryListItem {
  _id: string
  name: string
  image?: string
  parent?: string | null
  status: string
  createdAt: string
  updatedAt: string
  slug: string
  productCount?: number
  productsCount?: number
  subCategories?: SubCategoryItem[]
  subcategories?: SubCategoryItem[]
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface GetCategoriesParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetCategoriesResponse {
  success: boolean
  message: string
  pagination: PaginationMeta
  data: CategoryListItem[]
}

export interface SingleCategoryResponse {
  success: boolean
  message: string
  data: CategoryListItem
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
}

// ─── Categories API Endpoints ─────────────────────────────────────────────────

const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<GetCategoriesResponse, GetCategoriesParams | void>({
      query: (params) => ({
        url: '/categories',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getCategoryById: builder.query<SingleCategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<ApiResponse<CategoryListItem>, FormData>({
      query: (formData) => ({
        url: '/categories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<ApiResponse<CategoryListItem>, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi