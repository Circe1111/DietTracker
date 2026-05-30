/**
 * circleApi.ts — 前端圈子 API 客户端
 *
 * 封装对小圈子 Serverless API 的调用。
 * 开发环境调用 /api/circle，生产环境使用 Vercel 部署地址。
 */

const BASE = '/api/circle'

interface CircleData {
  circle: { id: string; name: string; inviteCode: string; createdAt: number }
  members: Array<{
    id: string; nickname: string; avatarColor: string
    checkedInToday: boolean; streak: number
    trend: 'up' | 'down' | 'stable'; joinedAt: number
  }>
}

async function req(action: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = action ? `${BASE}?action=${action}` : BASE
  const init: RequestInit = { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  const res = await fetch(url, init)
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
  return data
}

export async function getCircle(id: string): Promise<CircleData> {
  const params = new URLSearchParams({ id })
  const res = await fetch(`${BASE}?${params}`)
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed')
  return data as CircleData
}

export async function createCircle(body: { name: string; userId: string; nickname: string; color: string }) {
  return req('create', body) as Promise<{ circle: { id: string; name: string; inviteCode: string } }>
}

export async function joinCircle(body: { inviteCode: string; userId: string; nickname: string; color: string }) {
  return req('join', body) as Promise<{ circleId: string }>
}

export async function checkin(body: { circleId: string; userId: string; trend: 'up' | 'down' | 'stable' }) {
  return req('checkin', body) as Promise<{ success: boolean }>
}
