import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '../lib/queryClient'
import AppErrorBoundary from '../components/common/AppErrorBoundary'
import { AccessibilityProvider } from './AccessibilityProvider'
import { AuthProvider } from './AuthProvider'

export default function AppProviders({ children }) {
  return <AppErrorBoundary><QueryClientProvider client={queryClient}><AccessibilityProvider><AuthProvider>{children}<Toaster richColors position="top-right" /></AuthProvider></AccessibilityProvider></QueryClientProvider></AppErrorBoundary>
}
