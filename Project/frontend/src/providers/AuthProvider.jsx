import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'
import { authApi } from '../services/authApi'
import { queryKeys } from '../lib/queryKeys'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const session = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => authApi.me({ signal }),
    staleTime: 60_000,
    retry: (count, error) => error?.status !== 401 && count < 2,
  })

  const value = useMemo(() => ({
    user: session.data?.data?.user ?? null,
    isLoading: session.isLoading,
    error: session.error?.status === 401 ? null : session.error,
    refresh: session.refetch,
    setUser: (user) => queryClient.setQueryData(queryKeys.auth.me(), { data: { user } }),
    clearUser: () => queryClient.setQueryData(queryKeys.auth.me(), null),
  }), [queryClient, session.data, session.error, session.isLoading, session.refetch])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Context hooks intentionally live beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
