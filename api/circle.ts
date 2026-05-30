/**
 * Circle API — Vercel Serverless Function (Edge Runtime)
 *
 * 极简社交后端。开发环境使用内存存储，生产环境使用 Vercel KV。
 * 仅存：昵称、头像色、今日打卡、连续天数、体重趋势方向。
 *
 * API:
 *   GET  /api/circle?id=xxx          → 获取圈子 + 成员
 *   POST /api/circle?action=create   → 创建圈子 {name,userId,nickname,color}
 *   POST /api/circle?action=join     → 加入圈子 {inviteCode,userId,nickname,color}
 *   POST /api/circle?action=checkin  → 打卡 {circleId,userId,trend}
 */

interface Member {
  id: string; nickname: string; avatarColor: string
  checkedInToday: boolean; streak: number
  trend: 'up' | 'down' | 'stable'; joinedAt: number
}

function genId() { return Math.random().toString(36).slice(2, 14) }
function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase() }
function cors() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { ...cors(), 'Content-Type': 'application/json' } }) }

const mem = new Map<string, unknown>()
const store = {
  get: async <T>(k: string) => (mem.get(k) as T) ?? null,
  set: async (k: string, v: unknown) => { mem.set(k, v) },
  hget: async <T>(h: string, f: string) => { const o = mem.get(h) as Record<string, T> | undefined; return o?.[f] ?? null },
  hset: async (h: string, f: Record<string, unknown>) => { const e = (mem.get(h) as Record<string, unknown>) || {}; mem.set(h, { ...e, ...f }) },
  hgetall: async <T>(h: string) => (mem.get(h) as Record<string, T>) ?? null,
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() })
  try {
    const u = new URL(req.url); const a = u.searchParams.get('action') || ''
    if (req.method === 'GET') {
      const id = u.searchParams.get('id') || ''; if (!id) return json({ error: 'ID required' }, 400)
      const c = await store.get<{ id: string; name: string; inviteCode: string; createdAt: number }>(`c:${id}`)
      if (!c) return json({ error: 'Not found' }, 404)
      const m = await store.hgetall<Record<string, Member>>(`c:${id}:m`)
      return json({ circle: c, members: m ? Object.values(m) : [] })
    }
    if (req.method === 'POST') {
      const b = await req.json().catch(() => ({}))
      if (a === 'create') {
        if (!b.name || !b.userId) return json({ error: 'Missing fields' }, 400)
        const id = genId(); const code = genCode(); const n = Date.now()
        await store.set(`c:${id}`, { id, name: b.name, inviteCode: code, createdAt: n })
        await store.hset(`c:${id}:m`, { [b.userId]: { id: b.userId, nickname: b.nickname || '我', avatarColor: b.color || '#2D9B74', checkedInToday: false, streak: 0, trend: 'stable', joinedAt: n } })
        await store.set(`inv:${code}`, id)
        return json({ circle: { id, name: b.name, inviteCode: code } })
      }
      if (a === 'join') {
        if (!b.inviteCode || !b.userId) return json({ error: 'Missing fields' }, 400)
        const cid = await store.get<string>(`inv:${b.inviteCode}`); if (!cid) return json({ error: '邀请码无效' }, 404)
        const ex = await store.hget<Member>(`c:${cid}:m`, b.userId); if (ex) return json({ error: '已在圈子中' }, 409)
        await store.hset(`c:${cid}:m`, { [b.userId]: { id: b.userId, nickname: b.nickname || '新成员', avatarColor: b.color || '#F5A623', checkedInToday: false, streak: 0, trend: 'stable', joinedAt: Date.now() } })
        return json({ circleId: cid })
      }
      if (a === 'checkin') {
        if (!b.circleId || !b.userId) return json({ error: 'Missing fields' }, 400)
        const m = await store.hget<Member>(`c:${b.circleId}:m`, b.userId); if (!m) return json({ error: 'Not in circle' }, 404)
        m.checkedInToday = true; m.trend = b.trend || 'stable'
        await store.hset(`c:${b.circleId}:m`, { [b.userId]: m })
        return json({ success: true })
      }
    }
    return json({ error: 'Not found' }, 404)
  } catch { return json({ error: 'Server error' }, 500) }
}
