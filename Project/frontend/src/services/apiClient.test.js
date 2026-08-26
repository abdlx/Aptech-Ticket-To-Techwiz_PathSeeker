import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './apiClient'

afterEach(() => vi.restoreAllMocks())

describe('apiRequest', () => {
  it('serializes queries and returns the standard payload', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { items: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    await expect(apiRequest('/careers', { query: { domain: ['design', 'data'], page: 2 } })).resolves.toEqual({ data: { items: [] } })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/careers?domain=design&domain=data&page=2')
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include')
  })
  it('normalizes API errors and preserves the request ID', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Sign in required.', code: 'UNAUTHENTICATED', requestId: 'req-1' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    await expect(apiRequest('/auth/me')).rejects.toMatchObject({ name: 'ApiError', status: 401, code: 'UNAUTHENTICATED', requestId: 'req-1' })
  })
  it('handles empty 204 responses safely', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeNull()
  })
  it('uses ApiError for network failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'))
    await expect(apiRequest('/careers')).rejects.toBeInstanceOf(ApiError)
  })
})
