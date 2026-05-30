import { useState, useEffect, useCallback } from 'react'
import { Users, Copy, LogIn, Plus, Check, Flame, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GlassCard from '@/components/GlassCard'
import BottomSheet from '@/components/BottomSheet'
import { getSettings } from '@/lib/storage'
import { getCircle, createCircle, joinCircle, checkin } from '@/lib/circleApi'
import { cn } from '@/lib/utils'

interface CircleInfo { id: string; name: string; inviteCode: string }
interface CircleMember {
  id: string; nickname: string; avatarColor: string
  checkedInToday: boolean; streak: number
  trend: 'up' | 'down' | 'stable'
}

export default function Circle() {
  const [userId, setUserId] = useState('')
  const [nickname, setNickname] = useState('我')
  const [circle, setCircle] = useState<CircleInfo | null>(null)
  const [members, setMembers] = useState<CircleMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [circleName, setCircleName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    getSettings().then(s => {
      setUserId(`u_${Date.now().toString(36)}`)
      setNickname(s.gender === 'female' ? '小仙女' : '健身达人')
    })
  }, [])

  const loadCircle = useCallback(async (id: string) => {
    setLoading(true); setError('')
    try {
      const data = await getCircle(id)
      setCircle(data.circle)
      setMembers(data.members)
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!circleName.trim()) return
    setLoading(true); setError('')
    try {
      const data = await createCircle({ name: circleName, userId, nickname, color: '#2D9B74' })
      setCircle(data.circle as CircleInfo)
      setCreateOpen(false); setCircleName('')
      await loadCircle(data.circle.id)
    } catch (e) { setError((e as Error).message) }
    setLoading(false)
  }, [circleName, userId, nickname, loadCircle])

  const handleJoin = useCallback(async () => {
    if (!inviteCode.trim()) return
    setLoading(true); setError('')
    try {
      const data = await joinCircle({ inviteCode: inviteCode.toUpperCase(), userId, nickname, color: '#F5A623' })
      setJoinOpen(false); setInviteCode('')
      await loadCircle(data.circleId)
    } catch (e) { setError((e as Error).message) }
    setLoading(false)
  }, [inviteCode, userId, nickname, loadCircle])

  const handleCheckin = useCallback(async () => {
    if (!circle) return
    try {
      await checkin({ circleId: circle.id, userId, trend: 'stable' })
      await loadCircle(circle.id)
    } catch { /* ignore */ }
  }, [circle, userId, loadCircle])

  const copyInvite = () => {
    if (circle) navigator.clipboard.writeText(circle.inviteCode).catch(() => {})
  }

  const trendIcon = (t: string) => t === 'down' ? <TrendingDown size={14} className="text-success" /> : t === 'up' ? <TrendingUp size={14} className="text-destructive" /> : <Minus size={14} className="text-muted-foreground" />

  if (!userId) return null

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-card-title text-foreground">小圈子</h1>
        {circle && (
          <button onClick={() => loadCircle(circle.id)} className="p-2"><RefreshCw size={18} className={cn('text-muted-foreground', loading && 'animate-spin')} /></button>
        )}
      </div>

      {!circle ? (
        <GlassCard className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center">
            <Users size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-body font-medium">加入小圈子</p>
            <p className="text-micro text-muted-foreground mt-1">和朋友一起打卡，互相鼓励</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setCreateOpen(true)} className="rounded-xl"><Plus size={16} className="mr-1" /> 创建圈子</Button>
            <Button onClick={() => setJoinOpen(true)} variant="outline" className="rounded-xl glass"><LogIn size={16} className="mr-1" /> 加入圈子</Button>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Circle header */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"><Users size={20} className="text-primary" /></div>
                <div><p className="text-caption font-semibold">{circle.name}</p><p className="text-micro text-muted-foreground">{members.length} 人</p></div>
              </div>
              <button onClick={copyInvite} className="flex items-center gap-1 glass rounded-xl px-3 py-1.5 text-caption text-primary">
                <Copy size={14} /> {circle.inviteCode}
              </button>
            </div>
            <Button onClick={handleCheckin} className="w-full rounded-xl h-11">
              <Check size={16} className="mr-1" /> 今日打卡
            </Button>
          </GlassCard>

          {/* Members */}
          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">成员</p>
            {members.map(m => (
              <div key={m.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-caption flex-shrink-0" style={{ backgroundColor: m.avatarColor }}>
                  {m.nickname.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-medium">{m.nickname}</span>
                    {m.id === userId && <span className="text-micro text-muted-foreground">(我)</span>}
                  </div>
                  <div className="flex items-center gap-2 text-micro text-muted-foreground mt-0.5">
                    {m.checkedInToday ? <span className="text-success flex items-center gap-1"><Check size={12} /> 已打卡</span> : <span>未打卡</span>}
                    <span>·</span>
                    <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {m.streak}天</span>
                    <span className="flex items-center gap-1">{trendIcon(m.trend)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <div className="text-micro text-destructive text-center">{error}</div>}

      {/* Create Sheet */}
      <BottomSheet open={createOpen} onOpenChange={setCreateOpen} title="创建新圈子">
        <div className="space-y-4">
          <Input value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="圈子名称" className="glass h-11 rounded-xl" />
          <Button onClick={handleCreate} disabled={!circleName.trim() || loading} className="w-full rounded-xl h-11">创建</Button>
        </div>
      </BottomSheet>

      {/* Join Sheet */}
      <BottomSheet open={joinOpen} onOpenChange={setJoinOpen} title="加入圈子">
        <div className="space-y-4">
          <Input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="输入邀请码" className="glass h-11 rounded-xl text-center tracking-[0.2em] uppercase text-display" maxLength={8} />
          <Button onClick={handleJoin} disabled={inviteCode.length < 4 || loading} className="w-full rounded-xl h-11">加入</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
