import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Key, Download, Upload, Settings2, TrendingDown, TrendingUp, RotateCcw, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GlassCard from '@/components/GlassCard'
import {
  getSettings, saveSettings, getWeightEntries, addWeightEntry,
  getApiUsage, setDailyLimit, exportAllData, importAllData,
  type UserSettings, type WeightEntry,
} from '@/lib/storage'
import { calcBMI, bmiCategory } from '@/lib/calc'
import { getAllDietProfiles } from '@/data/dietProfiles'
import { cn } from '@/lib/utils'

// ── Mini inline chart (no recharts dep for now — lightweight SVG) ──
function WeightMiniChart({ entries, target }: { entries: WeightEntry[]; target: number }) {
  if (entries.length < 2) {
    return <div className="text-micro text-muted-foreground text-center py-4">记录更多体重数据后显示趋势图</div>
  }
  const w = 320; const h = 120; const pad = 20
  const allWeights = entries.map(e => e.weight)
  const minW = Math.min(...allWeights, target) - 2
  const maxW = Math.max(...allWeights, target) + 2
  const range = maxW - minW || 1
  const xStep = (w - pad * 2) / (entries.length - 1)
  const points = entries.map((e, i) => `${pad + i * xStep},${h - pad - ((e.weight - minW) / range) * (h - pad * 2)}`).join(' ')
  const targetY = h - pad - ((target - minW) / range) * (h - pad * 2)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Target line */}
      <line x1={pad} y1={targetY} x2={w - pad} y2={targetY} stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
      <text x={w - pad} y={targetY - 4} textAnchor="end" className="text-[8px]" fill="hsl(var(--primary))" opacity="0.7">目标 {target}kg</text>
      {/* Baseline */}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="hsl(var(--border))" strokeWidth="0.5" />
      {/* Weight line */}
      <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {entries.map((e, i) => (
        <circle key={i} cx={pad + i * xStep} cy={h - pad - ((e.weight - minW) / range) * (h - pad * 2)} r="3" fill="#60a5fa" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [apiUsage, setApiUsage] = useState({ daily: 0, monthly: 0, dailyLimit: 20 })
  const [limitInput, setLimitInput] = useState('20')
  const [nickname, setNickname] = useState('')
  const [avatarColor, setAvatarColor] = useState('#2D9B74')
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    const s = await getSettings()
    setSettings(s)
    setNickname(s.nickname || '')
    setAvatarColor(s.avatarColor || '#2D9B74')
    const now = new Date()
    const from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10)
    const to = now.toISOString().slice(0, 10)
    setWeights(await getWeightEntries(from, to))
    const u = await getApiUsage()
    setApiUsage(u)
    setLimitInput(String(u.dailyLimit))
  }, [])
  useEffect(() => { load() }, [load])

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight)
    if (!w || w < 20 || w > 300) return
    const h = settings?.height ?? 170
    await addWeightEntry({ date: new Date().toISOString().slice(0, 10), weight: w, bmi: calcBMI(w, h), createdAt: Date.now() })
    setNewWeight('')
    await load()
  }

  const handleSaveLimit = async () => {
    const v = parseInt(limitInput) || 20
    await setDailyLimit(Math.max(1, Math.min(v, 100)))
    const u = await getApiUsage()
    setApiUsage(u)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `diettracker-${new Date().toISOString().slice(0, 10)}.json`; a.click()
      URL.revokeObjectURL(url)
    } catch { }
    setExporting(false)
  }

  const handleImport = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        await importAllData(data)
        await load()
        alert('数据导入成功！')
      } catch { alert('导入失败，请检查文件格式') }
    }
    input.click()
  }

  const handleSaveProfile = async () => {
    await saveSettings({ nickname, avatarColor })
    await load()
  }

  const latestWeight = weights[weights.length - 1]?.weight ?? settings?.weight ?? 70
  const bmi = calcBMI(latestWeight, settings?.height ?? 170)
  const weightDiff = weights.length >= 2 ? latestWeight - weights[weights.length - 2].weight : 0

  if (!settings) return null

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <h1 className="text-card-title text-foreground">设置</h1>

      {/* ── Profile ── */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2"><UserCircle size={18} className="text-primary" /><span className="text-caption font-semibold">个人资料</span></div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-display font-bold flex-shrink-0" style={{ backgroundColor: avatarColor }}>
            {nickname ? nickname.slice(0, 2) : '我'}
          </div>
          <div className="flex-1 space-y-2">
            <Input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="你的昵称" className="glass h-10 rounded-xl text-body" />
            <div className="flex gap-1.5 flex-wrap">
              {['#2D9B74','#60a5fa','#f87171','#fbbf24','#a78bfa','#fb923c','#34d399','#f472b6'].map(c => (
                <button key={c} onClick={() => setAvatarColor(c)} className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: avatarColor === c ? 'white' : 'transparent', boxShadow: avatarColor === c ? '0 0 0 2px ' + c : 'none' }} />
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleSaveProfile} variant="outline" size="sm" className="rounded-xl w-full">保存资料</Button>
      </GlassCard>

      {/* ── Weight ── */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2"><Scale size={18} className="text-primary" /><span className="text-caption font-semibold">体重追踪</span></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-display text-foreground">{latestWeight}<span className="text-body text-muted-foreground"> kg</span></div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-caption text-muted-foreground">BMI {bmi} · {bmiCategory(bmi)}</span>
              {weightDiff !== 0 && (
                <span className={cn('text-micro flex items-center gap-0.5', weightDiff > 0 ? 'text-destructive' : 'text-success')}>
                  {weightDiff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(weightDiff).toFixed(1)}kg
                </span>
              )}
            </div>
          </div>
          <div className="bg-primary-light text-primary text-caption font-semibold px-3 py-1.5 rounded-xl">
            目标 {settings.targetWeight}kg
          </div>
        </div>

        {/* Weight trend chart */}
        <WeightMiniChart entries={weights} target={settings.targetWeight} />

        {/* Add weight */}
        <div className="flex gap-2">
          <Input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="输入今日体重" className="glass h-11 rounded-xl text-body" step="0.1" />
          <Button onClick={handleAddWeight} disabled={!newWeight} className="rounded-xl h-11"><Scale size={16} className="mr-1" /> 记录</Button>
        </div>
      </GlassCard>

      {/* ── API ── */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2"><Key size={18} className="text-primary" /><span className="text-caption font-semibold">API 管理</span></div>
        <div className="text-caption text-muted-foreground">今日: {apiUsage.daily} 次 · 本月: {apiUsage.monthly} 次</div>
        <div className="flex items-center gap-2">
          <span className="text-micro text-muted-foreground">每日上限:</span>
          <Input type="number" value={limitInput} onChange={e => setLimitInput(e.target.value)} className="glass h-9 w-20 text-caption rounded-lg" />
          <Button size="sm" onClick={handleSaveLimit} variant="outline" className="rounded-lg h-9">保存</Button>
        </div>
      </GlassCard>

      {/* ── Diet Profile ── */}
      <GlassCard className="space-y-2">
        <div className="flex items-center gap-2"><Settings2 size={18} className="text-primary" /><span className="text-caption font-semibold">饮食框架</span></div>
        <div className="grid grid-cols-2 gap-2">
          {getAllDietProfiles().map(p => (
            <button key={p.id} onClick={async () => { await saveSettings({ dietProfile: p.id }); await load() }}
              className={cn('glass rounded-xl p-2.5 text-left transition-all',
                settings.dietProfile === p.id ? 'ring-2 ring-primary bg-primary-light/50' : 'hover:shadow-glass-hover')}>
              <div className="flex items-center gap-1.5"><span>{p.emoji}</span><span className="text-caption font-medium">{p.name}</span></div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ── Data ── */}
      <GlassCard className="space-y-3">
        <div className="text-caption font-semibold">数据管理</div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleExport} disabled={exporting} variant="outline" className="rounded-xl glass h-11"><Download size={16} className="mr-1" /> 导出 JSON</Button>
          <Button onClick={handleImport} variant="outline" className="rounded-xl glass h-11"><Upload size={16} className="mr-1" /> 导入数据</Button>
        </div>
        <p className="text-micro text-muted-foreground">导出包含所有历史记录，可用于备份或迁移</p>
      </GlassCard>

      {/* ── Reset Setup ── */}
      <Button onClick={async () => { await saveSettings({ setupComplete: false }); navigate('/setup') }} variant="outline" className="w-full rounded-xl glass h-11 text-destructive hover:text-destructive">
        <RotateCcw size={16} className="mr-1" /> 重新运行设置向导
      </Button>
    </div>
  )
}
