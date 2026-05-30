import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, TrendingDown, Minus, Flame, Dumbbell, Scale, Sparkles } from 'lucide-react'
import GlassCard from '@/components/GlassCard'
import CircularProgress from '@/components/CircularProgress'
import MacroBar from '@/components/MacroBar'
import { Button } from '@/components/ui/button'
import { getTodayFoodLog, getTodayExerciseLog, getWeightEntries, getSettings, type UserSettings } from '@/lib/storage'
import { generateAdvice } from '@/lib/dailyAdvice'

export default function Dashboard() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [todayCal, setTodayCal] = useState(0)
  const [todayProtein, setTodayProtein] = useState(0)
  const [todayFat, setTodayFat] = useState(0)
  const [todayCarbs, setTodayCarbs] = useState(0)
  const [entryCount, setEntryCount] = useState(0)
  const [exerciseMin, setExerciseMin] = useState(0)
  const [exerciseCal, setExerciseCal] = useState(0)
  const [weightTrend, setWeightTrend] = useState<'up' | 'down' | 'stable' | 'none'>('none')
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [advice, setAdvice] = useState('')

  const loadData = useCallback(async () => {
    const s = await getSettings()
    setSettings(s)

    const foodLog = await getTodayFoodLog()
    const entries = foodLog?.entries ?? []
    setEntryCount(entries.length)
    setTodayCal(entries.reduce((a, e) => a + e.calories, 0))
    setTodayProtein(entries.reduce((a, e) => a + e.protein, 0))
    setTodayFat(entries.reduce((a, e) => a + e.fat, 0))
    setTodayCarbs(entries.reduce((a, e) => a + e.carbs, 0))

    const exLog = await getTodayExerciseLog()
    const exEntries = exLog?.entries ?? []
    setExerciseMin(exEntries.reduce((a, e) => a + e.duration, 0))
    setExerciseCal(exEntries.reduce((a, e) => a + e.caloriesBurned, 0))

    const now = new Date()
    const from = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10)
    const to = now.toISOString().slice(0, 10)
    const weights = await getWeightEntries(from, to)
    if (weights.length >= 2) {
      const latest = weights[weights.length - 1]
      const prev = weights[weights.length - 2]
      setLatestWeight(latest.weight)
      if (latest.weight > prev.weight + 0.2) setWeightTrend('up')
      else if (latest.weight < prev.weight - 0.2) setWeightTrend('down')
      else setWeightTrend('stable')
    } else if (weights.length === 1) {
      setLatestWeight(weights[0].weight)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Generate advice when data changes
  useEffect(() => {
    if (!settings) return
    const calBudget = settings.dailyCalorieBudget
    const targets = settings.macroTargets
    setAdvice(generateAdvice({
      caloriesConsumed: todayCal,
      caloriesBudget: calBudget,
      macros: { protein: todayProtein, fat: todayFat, carbs: todayCarbs },
      macroTargets: targets,
      exerciseMinutes: exerciseMin,
      entriesCount: entryCount,
      weightTrend,
    }))
  }, [settings, todayCal, todayProtein, todayFat, todayCarbs, exerciseMin, entryCount, weightTrend])

  if (!settings) return null

  const budget = settings.dailyCalorieBudget
  const remaining = Math.max(0, budget - todayCal + exerciseCal)
  const calPct = budget > 0 ? Math.round((todayCal / budget) * 100) : 0
  const targets = settings.macroTargets

  // Detect if setup is needed
  if (!settings.setupComplete) {
    navigate('/setup')
    return null
  }

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()]
  const hour = today.getHours()
  const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <p className="text-caption text-muted-foreground">{dateStr} 星期{weekDay}</p>
          <h1 className="text-display text-foreground mt-0.5">{greeting} 👋</h1>
        </div>
      </div>

      {/* Row 1: Calories Ring + Budget + QuickAdd */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories Ring */}
        <GlassCard className="flex flex-col items-center justify-center py-4 row-span-2">
          <CircularProgress
            value={calPct}
            size={120}
            strokeWidth={9}
            label={`${todayCal}`}
            sublabel={`/ ${budget} kcal`}
            warnAt={95}
          />
          <p className="text-micro text-muted-foreground mt-2">
            {calPct <= 100 ? `剩余 ${remaining}` : `超出 ${todayCal - budget}`}
          </p>
        </GlassCard>

        {/* Budget + QuickAdd */}
        <GlassCard className="flex flex-col items-center justify-center py-3 space-y-3">
          <div className="text-center">
            <p className="text-caption text-muted-foreground">剩余预算</p>
            <p className="text-card-title text-primary font-bold mt-1">{remaining} kcal</p>
            <p className="text-micro text-muted-foreground mt-0.5">
              运动消耗 {exerciseCal}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/food')}
            className="rounded-xl w-full"
          >
            <Plus size={16} className="mr-1" /> 记一笔
          </Button>
        </GlassCard>
      </div>

      {/* Row 2: Macro Progress */}
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-caption text-muted-foreground">今日营养摄入</p>
          <p className="text-micro text-muted-foreground">
            {entryCount} 项记录 · {todayCal} kcal
          </p>
        </div>
        <MacroBar label="蛋白质" current={todayProtein} target={targets.protein} unit="g" color="#60a5fa" />
        <MacroBar label="脂肪" current={todayFat} target={targets.fat} unit="g" color="#fbbf24" />
        <MacroBar label="碳水" current={todayCarbs} target={targets.carbs} unit="g" color="#34d399" />
      </GlassCard>

      {/* Row 3: Exercise + Weight (dual) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Exercise */}
        <GlassCard
          hoverable
          onClick={() => navigate('/exercise')}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-secondary" />
            <p className="text-caption font-medium">运动</p>
          </div>
          <p className="text-card-title font-bold">
            {exerciseMin > 0 ? `${exerciseMin}分钟` : '未运动'}
          </p>
          {exerciseCal > 0 && (
            <div className="flex items-center gap-1 text-micro text-muted-foreground">
              <Flame size={12} className="text-orange-400" />
              {exerciseCal} kcal
            </div>
          )}
          {exerciseMin === 0 && (
            <p className="text-micro text-muted-foreground">点击记录运动 →</p>
          )}
        </GlassCard>

        {/* Weight */}
        <GlassCard
          hoverable
          onClick={() => navigate('/settings')}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-primary" />
            <p className="text-caption font-medium">体重</p>
          </div>
          {latestWeight ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-card-title font-bold">{latestWeight} kg</p>
                {weightTrend === 'down' && (
                  <TrendingDown size={16} className="text-success" />
                )}
                {weightTrend === 'up' && (
                  <TrendingUp size={16} className="text-destructive" />
                )}
                {weightTrend === 'stable' && (
                  <Minus size={16} className="text-muted-foreground" />
                )}
              </div>
              <p className="text-micro text-muted-foreground">
                目标 {settings.targetWeight}kg
              </p>
            </>
          ) : (
            <p className="text-micro text-muted-foreground">暂无数据</p>
          )}
        </GlassCard>
      </div>

      {/* Row 4: Smart Advice */}
      {advice && (
        <GlassCard hoverable className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} className="text-primary" />
          </div>
          <p className="text-body text-foreground leading-relaxed">{advice}</p>
        </GlassCard>
      )}
    </div>
  )
}
