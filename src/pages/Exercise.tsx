import { useState, useEffect, useCallback } from 'react'
import { Clock, Plus, ChevronDown, ChevronUp, Flame, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GlassCard from '@/components/GlassCard'
import BottomSheet from '@/components/BottomSheet'
import { EXERCISES, EXERCISE_CATEGORIES, QUICK_EXERCISES, findExercise } from '@/data/exercises'
import { getTodayExerciseLog, saveExerciseLog, getSettings, type ExerciseLog as ExLogType, type ExerciseEntry } from '@/lib/storage'
import { calcExerciseCalories } from '@/lib/calc'
import { cn } from '@/lib/utils'
import type { ExerciseItem } from '@/data/exercises'

export default function Exercise() {
  const [todayLog, setTodayLog] = useState<ExLogType | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [duration, setDuration] = useState(30)
  const [customName, setCustomName] = useState('')
  const [customMet, setCustomMet] = useState('5')
  const [weight, setWeight] = useState(70)

  const load = useCallback(async () => {
    const log = await getTodayExerciseLog()
    setTodayLog(log)
    const s = await getSettings()
    setWeight(s.weight)
  }, [])
  useEffect(() => { load() }, [load])

  const addExercise = useCallback(async (exercise: ExerciseItem, mins: number) => {
    const cal = calcExerciseCalories(exercise.met, weight, mins)
    const entry: ExerciseEntry = { name: exercise.name, met: exercise.met, duration: mins, caloriesBurned: cal, createdAt: Date.now() }
    const existing = await getTodayExerciseLog()
    const log: ExLogType = existing ?? { date: new Date().toISOString().slice(0, 10), entries: [], createdAt: Date.now(), updatedAt: Date.now() }
    log.entries.push(entry); log.updatedAt = Date.now()
    await saveExerciseLog(log)
    await load()
    setAddingId(null); setDuration(30)
  }, [weight, load])

  const addCustom = useCallback(async () => {
    if (!customName.trim()) return
    const met = parseFloat(customMet) || 5
    const cal = calcExerciseCalories(met, weight, duration)
    const entry: ExerciseEntry = { name: customName, met, duration, caloriesBurned: cal, createdAt: Date.now() }
    const existing = await getTodayExerciseLog()
    const log: ExLogType = existing ?? { date: new Date().toISOString().slice(0, 10), entries: [], createdAt: Date.now(), updatedAt: Date.now() }
    log.entries.push(entry); log.updatedAt = Date.now()
    await saveExerciseLog(log)
    await load()
    setCustomOpen(false); setCustomName(''); setCustomMet('5'); setDuration(30)
  }, [customName, customMet, duration, weight, load])

  const entries = todayLog?.entries ?? []
  const totalMin = entries.reduce((a, e) => a + e.duration, 0)
  const totalCal = entries.reduce((a, e) => a + e.caloriesBurned, 0)
  const maxDuration = Math.max(totalMin, 60)

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-card-title text-foreground">运动记录</h1>

      {/* Quick buttons */}
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-caption text-muted-foreground">快捷记录</p>
          <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-micro text-primary">
            {showMore ? <><ChevronUp size={14} /> 收起</> : <><ChevronDown size={14} /> 更多</>}
          </button>
        </div>
        <div className="flex gap-3">
          {QUICK_EXERCISES.map((ex) => (
            <button key={ex.id} onClick={() => { setAddingId(ex.id); setDuration(30) }}
              className="flex-1 glass rounded-xl p-3 text-center hover:shadow-glass-hover transition-all space-y-1">
              <div className="text-2xl">{ex.emoji}</div>
              <div className="text-caption font-medium">{ex.name}</div>
              <div className="text-micro text-muted-foreground">MET {ex.met}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Duration picker when adding */}
      {addingId && (
        <GlassCard className="space-y-3 animate-scale-in">
          <p className="text-caption text-muted-foreground">记录时长</p>
          <div className="flex gap-2 flex-wrap">
            {[10, 15, 20, 30, 45, 60, 90].map(m => (
              <button key={m} onClick={() => setDuration(m)}
                className={cn('glass rounded-xl px-4 py-2 text-caption transition-all', duration === m && 'ring-2 ring-primary bg-primary-light text-primary')}>
                {m}分钟
              </button>
            ))}
            <div className="relative"><Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)}
              className="glass h-9 w-20 text-caption rounded-xl" placeholder="自定义" /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addExercise(findExercise(addingId)!, duration)} className="flex-1 rounded-xl h-10">
              <Clock size={16} className="mr-1" /> 记录 {duration}分钟
            </Button>
            <Button variant="ghost" onClick={() => setAddingId(null)} className="rounded-xl">取消</Button>
          </div>
        </GlassCard>
      )}

      {/* Full exercise list (more) */}
      {showMore && (
        <div className="space-y-4 animate-slide-up">
          {EXERCISE_CATEGORIES.map(cat => {
            const items = EXERCISES.filter(e => e.category === cat)
            if (!items.length) return null
            return (
              <GlassCard key={cat} className="space-y-2">
                <p className="text-caption text-muted-foreground">{cat}</p>
                <div className="space-y-1.5">
                  {items.map(ex => (
                    <button key={ex.id} onClick={() => { setAddingId(ex.id); setDuration(30) }}
                      className="w-full flex items-center justify-between glass rounded-xl p-2.5 hover:shadow-glass-hover transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ex.emoji}</span>
                        <div className="text-left"><div className="text-caption font-medium">{ex.name}</div><div className="text-micro text-muted-foreground">MET {ex.met}</div></div>
                      </div>
                      <Plus size={16} className="text-primary" />
                    </button>
                  ))}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Today's summary bar */}
      {entries.length > 0 && (
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Flame size={18} className="text-orange-400" /><span className="text-caption font-medium">今日运动</span></div>
            <span className="text-caption text-muted-foreground">{totalMin}分钟 · {totalCal}kcal</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden flex">
            {entries.map((e, i) => {
              const pct = (e.duration / maxDuration) * 100
              const colors = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#fb923c']
              return <div key={i} style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: colors[i % colors.length] }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all" title={`${e.name} ${e.duration}min`} />
            })}
          </div>
          <div className="space-y-1.5">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-caption">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'][i % 6] }} />
                  <span>{e.name}</span>
                </div>
                <span className="text-muted-foreground">{e.duration}min · {e.caloriesBurned}kcal</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Custom exercise button */}
      <Button variant="outline" onClick={() => setCustomOpen(true)} className="w-full rounded-xl glass"><Plus size={16} className="mr-1" /> 自定义运动</Button>

      {/* Custom bottom sheet */}
      <BottomSheet open={customOpen} onOpenChange={setCustomOpen} title="自定义运动">
        <div className="space-y-4">
          <div><label className="text-caption text-muted-foreground mb-1.5 block">运动名称</label><Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="如：攀岩" className="glass h-11 rounded-xl" /></div>
          <div><label className="text-caption text-muted-foreground mb-1.5 block">MET 值 (运动强度)</label><Input type="number" value={customMet} onChange={e => setCustomMet(e.target.value)} placeholder="5.0" className="glass h-11 rounded-xl" /></div>
          <div><label className="text-caption text-muted-foreground mb-1.5 block">时长 (分钟)</label><div className="flex gap-2 flex-wrap">{[15, 30, 45, 60, 90].map(m => <button key={m} onClick={() => setDuration(m)} className={cn('glass rounded-xl px-4 py-2 text-caption', duration === m && 'ring-2 ring-primary bg-primary-light text-primary')}>{m}分钟</button>)}</div></div>
          <div className="text-center text-caption text-muted-foreground">预计消耗: {Math.round(parseFloat(customMet || '5') * weight * (duration / 60))} kcal</div>
          <Button onClick={addCustom} className="w-full rounded-xl h-11"><Dumbbell size={16} className="mr-1" /> 记录运动</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
