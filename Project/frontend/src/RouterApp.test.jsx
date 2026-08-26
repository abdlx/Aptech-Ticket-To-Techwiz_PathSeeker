import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import AppProviders from './providers/AppProviders'
import RouterApp from './RouterApp'
import { queryClient } from './lib/queryClient'

afterEach(() => { vi.restoreAllMocks(); queryClient.clear() })

it('renders a direct login URL with the real router', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Sign in required.', code: 'UNAUTHENTICATED' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
  render(<MemoryRouter initialEntries={['/login']}><AppProviders><RouterApp /></AppProviders></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
})

it('protects direct user routes and returns to login', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Sign in required.', code: 'UNAUTHENTICATED' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
  render(<MemoryRouter initialEntries={['/app/dashboard']}><AppProviders><RouterApp /></AppProviders></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
})
