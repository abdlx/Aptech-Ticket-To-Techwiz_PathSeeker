import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({ defaultOptions: {
  queries: { staleTime: 30_000, refetchOnWindowFocus: true, retry: (count, error) => ![400, 401, 403, 404].includes(error?.status) && count < 2, retryDelay: (attempt) => Math.min(500 * (2 ** attempt), 3000) },
  mutations: { retry: false },
} })
