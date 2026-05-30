import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, FileText, Search, Plus, History, WifiOff, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import GlassCard from '@/components/GlassCard'
import MacroBar from '@/components/MacroBar'
import FoodResultCard, { type FoodEntryData } from '@/components/FoodResultCard'
import { recognizeFood, parseIngredients } from '@/lib/openai'
import { FOODS, FOOD_CATEGORIES } from '@/data/foods'
import {
  getTodayFoodLog,
  saveFoodLog,
  type FoodLog as FoodLogType,
  type FoodEntry,
} from '@/lib/storage'
import { cn } from '@/lib/utils'

type Mode = 'camera' | 'text' | 'manual'
type Status = 'idle' | 'loading' | 'result' | 'error'

const MEAL_TYPES = [
  ['breakfast', '早餐'],
  ['lunch', '午餐'],
  ['dinner', '晚餐'],
  ['snack', '加餐'],
] as const

export default function FoodLog() {
  const [mode, setMode] = useState<Mode>('camera')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [resultData, setResultData] = useState<FoodEntryData | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [ingredientText, setIngredientText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [customEntry, setCustomEntry] = useState<FoodEntryData | null>(null)
  const [mealType, setMealType] = useState<string>('lunch')
  const [todayLog, setTodayLog] = useState<FoodLogType | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => { getTodayFoodLog().then(setTodayLog) }, [])

  const refresh = useCallback(async () => {
    setTodayLog(await getTodayFoodLog())
  }, [])

  // ── Camera ──
  const handleCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('loading'); setError(''); setResultData(null)
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = rej
        r.readAsDataURL(file)
      })
      setImageBase64(base64)
      const result = await recognizeFood(base64)
      setResultData({ name: result.name, calories: result.calories, protein: result.protein, fat: result.fat, carbs: result.carbs, portion: result.portion, imageBase64: base64 })
      setStatus('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败')
      setStatus('error')
    }
  }, [])

  // ── Ingredient ──
  const handleParse = useCallback(async () => {
    if (!ingredientText.trim()) return
    setStatus('loading'); setError(''); setResultData(null); setImageBase64(null)
    try {
      const result = await parseIngredients(ingredientText)
      setResultData({ name: result.name, calories: result.calories, protein: result.protein, fat: result.fat, carbs: result.carbs, portion: '100g' })
      setStatus('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败')
      setStatus('error')
    }
  }, [ingredientText])

  // ── Confirm ──
  const handleConfirm = useCallback(async (data: FoodEntryData) => {
    try {
      const entry: FoodEntry = { name: data.name, calories: data.calories, protein: data.protein, fat: data.fat, carbs: data.carbs, portion: data.portion, mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack', imageBase64: data.imageBase64, createdAt: Date.now() }
      const existing = await getTodayFoodLog()
      const log: FoodLogType = existing ?? { date: new Date().toISOString().slice(0, 10), entries: [], createdAt: Date.now(), updatedAt: Date.now() }
      log.entries.push(entry)
      log.updatedAt = Date.now()
      await saveFoodLog(log)
      setStatus('idle'); setResultData(null); setImageBase64(null); setIngredientText(''); setCustomEntry(null); setError('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await refresh()
    } catch { setError('保存失败') }
  }, [mealType, refresh])

  const filteredFoods = searchQuery.trim() ? FOODS.filter(f => f.name.includes(searchQuery) || f.category.includes(searchQuery)).slice(0, 20) : []

  const entries = todayLog?.entries ?? []
  const totals = entries.reduce((a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein, fat: a.fat + e.fat, carbs: a.carbs + e.carbs }), { calories: 0, protein: 0, fat: 0, carbs: 0 })

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-card-title text-foreground">饮食记录</h1>
        {!isOnline && <span className="flex items-center gap-1 text-warning text-micro"><WifiOff size={14} /> 离线</span>}
      </div>

      {/* Meal type */}
      <div className="flex gap-2">
        {MEAL_TYPES.map(([v, l]) => (
          <button key={v} onClick={() => setMealType(v)} className={cn('flex-1 py-2 rounded-xl text-caption font-medium transition-all', mealType === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{l}</button>
        ))}
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setStatus('idle'); setResultData(null); setError('') }}>
        <TabsList className="grid grid-cols-3 glass">
          <TabsTrigger value="camera" className="rounded-lg"><Camera size={16} className="mr-1" /> 拍照</TabsTrigger>
          <TabsTrigger value="text" className="rounded-lg"><FileText size={16} className="mr-1" /> 配料</TabsTrigger>
          <TabsTrigger value="manual" className="rounded-lg"><Search size={16} className="mr-1" /> 搜索</TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-4 space-y-4">
          {!isOnline && <GlassCard className="flex items-center gap-3"><WifiOff size={20} className="text-warning" /><div><div className="text-caption font-medium">离线模式</div><div className="text-micro text-muted-foreground">拍照需要网络，请切换到搜索模式</div></div></GlassCard>}
          <div className="glass bento-card text-center space-y-4 py-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-light flex items-center justify-center"><Camera size={36} className="text-primary" /></div>
            <p className="text-body">拍照识别食物</p>
            <p className="text-micro text-muted-foreground">AI 自动分析营养数据</p>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={status === 'loading' || !isOnline} className="rounded-xl h-11">
              {status === 'loading' ? '识别中...' : <><Camera size={18} className="mr-1" /> 拍照</>}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-4 space-y-4">
          <GlassCard className="space-y-3">
            <Textarea placeholder="输入食品配料表，AI 估算营养成分..." value={ingredientText} onChange={e => setIngredientText(e.target.value)} className="glass min-h-[120px] text-body rounded-xl resize-none" disabled={!isOnline} />
            <Button onClick={handleParse} disabled={!ingredientText.trim() || status === 'loading' || !isOnline} className="w-full rounded-xl h-11">{status === 'loading' ? '解析中...' : '解析配料表'}</Button>
          </GlassCard>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索食物..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="glass pl-10 h-11 rounded-xl" />
          </div>
          {searchQuery && filteredFoods.length > 0 && (
            <div className="space-y-2">
              {filteredFoods.map((food, i) => (
                <button key={`${food.name}-${i}`} onClick={() => { setCustomEntry({ name: food.name, calories: food.calories, protein: food.protein, fat: food.fat, carbs: food.carbs, portion: food.portion ?? '100g' }); setSearchQuery(''); setStatus('result') }} className="w-full text-left glass rounded-xl p-3 hover:shadow-glass-hover">
                  <div className="flex items-center justify-between">
                    <div><div className="text-body font-medium">{food.name}</div><div className="text-micro text-muted-foreground">{food.category} · {food.calories}kcal</div></div>
                    <Plus size={18} className="text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}
          {!searchQuery && (
            <GlassCard className="space-y-3">
              <div className="text-caption text-muted-foreground">按分类浏览</div>
              <div className="flex flex-wrap gap-2">
                {FOOD_CATEGORIES.map(cat => <button key={cat} onClick={() => setSearchQuery(cat)} className="glass rounded-xl px-3 py-1.5 text-caption">{cat}</button>)}
              </div>
            </GlassCard>
          )}
          <CustomEntryForm onAdd={(data) => { setCustomEntry(data); setStatus('result') }} />
        </TabsContent>
      </Tabs>

      {/* Error */}
      {status === 'error' && error && (
        <GlassCard className="border-destructive/30 space-y-3">
          <div className="flex items-center gap-2"><AlertCircle size={18} className="text-destructive" /><span className="text-caption text-destructive font-medium">出错</span></div>
          <p className="text-micro text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setStatus('idle'); setError('') }} className="rounded-xl">重试</Button>
            <Button variant="outline" size="sm" onClick={() => setMode('manual')} className="rounded-xl">手动录入</Button>
          </div>
        </GlassCard>
      )}

      {/* Result */}
      {status === 'result' && (resultData || customEntry) && (
        <FoodResultCard data={resultData ?? customEntry!} imageBase64={resultData?.imageBase64 ?? (imageBase64 ?? undefined)} onConfirm={handleConfirm} onCancel={() => { setStatus('idle'); setResultData(null); setCustomEntry(null) }} />
      )}

      {/* Today's log */}
      {entries.length > 0 && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between"><h2 className="text-caption text-muted-foreground">今日记录</h2><span className="text-micro text-primary font-semibold">{totals.calories} kcal</span></div>
          <GlassCard className="space-y-3">
            <MacroBar label="蛋白质" current={totals.protein} target={100} unit="g" color="#60a5fa" compact />
            <MacroBar label="脂肪" current={totals.fat} target={55} unit="g" color="#fbbf24" compact />
            <MacroBar label="碳水" current={totals.carbs} target={275} unit="g" color="#34d399" compact />
          </GlassCard>
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">{e.mealType === 'breakfast' ? '🌅' : e.mealType === 'lunch' ? '☀️' : e.mealType === 'dinner' ? '🌙' : '🍪'}</div>
                <div className="flex-1 min-w-0"><div className="text-body font-medium truncate">{e.name}</div><div className="text-micro text-muted-foreground">{e.portion} · {e.calories}kcal</div></div>
                <div className="text-right"><div className="text-caption font-semibold">{e.calories}</div><div className="text-micro text-muted-foreground">kcal</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && status === 'idle' && <div className="flex items-center gap-2 mt-4 text-caption text-muted-foreground"><History size={16} /> 今天还没有记录</div>}
    </div>
  )
}

// ── Custom Entry Form ──
function CustomEntryForm({ onAdd }: { onAdd: (data: FoodEntryData) => void }) {
  const add = () => {
    const get = (id: string) => (document.getElementById('cf-' + id) as HTMLInputElement)?.value?.trim()
    const name = get('name')
    if (!name) return
    onAdd({ name, calories: parseInt(get('cal') || '0') || 0, protein: parseInt(get('prot') || '0') || 0, fat: parseInt(get('fat') || '0') || 0, carbs: parseInt(get('carb') || '0') || 0, portion: get('portion') || '1份' })
    ;['name', 'cal', 'prot', 'fat', 'carb', 'portion'].forEach(id => { const el = document.getElementById('cf-' + id) as HTMLInputElement; if (el) el.value = '' })
  }
  return (
    <GlassCard className="space-y-3">
      <div className="text-caption text-muted-foreground">自定义录入</div>
      <div className="grid grid-cols-2 gap-2">
        {[{ id: 'name', label: '名称', ph: '番茄炒蛋', type: 'text' }, { id: 'cal', label: '热量(kcal)', ph: '0', type: 'number' }, { id: 'prot', label: '蛋白质(g)', ph: '0', type: 'number' }, { id: 'fat', label: '脂肪(g)', ph: '0', type: 'number' }, { id: 'carb', label: '碳水(g)', ph: '0', type: 'number' }, { id: 'portion', label: '份量', ph: '1份', type: 'text' }].map(f => (
          <div key={f.id}><label className="text-micro text-muted-foreground">{f.label}</label><Input id={'cf-' + f.id} type={f.type} placeholder={f.ph} className="h-9 text-caption rounded-lg" /></div>
        ))}
      </div>
      <Button onClick={add} className="w-full rounded-xl h-10" variant="outline"><Plus size={16} className="mr-1" /> 添加</Button>
    </GlassCard>
  )
}
