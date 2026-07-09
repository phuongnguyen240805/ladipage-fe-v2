import { getPlatformAuthHeaders } from '@/lib/platform-auth.client'

export function bffHeaders(orgId?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (orgId) headers['x-org-id'] = orgId
  return headers
}

export async function bffJson<T>(url: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getPlatformAuthHeaders()
  const extra = (init?.headers as Record<string, string> | undefined) ?? {}
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { ...authHeaders, ...extra },
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}