import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles, Key, User, Apple } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import GlassCard from '@/components/GlassCard'
import { encrypt } from '@/lib/crypto'
import { saveSettings } from '@/lib/storage'
import { calcDailyBudget, calcMacros, calcBMI } from '@/lib/calc'
import { getAllDietProfiles, getDietProfile } from '@/data/dietProfiles'

const STEPS = ['API Key', '个人信息', '饮食框架', '计划生成']

// ── Step 1: API Key ──
function StepApiKey({
  value,
  onChange,
  onTest,
  testing,
  testResult,
}: {
  value: string
  onChange: (v: string) => void
  onTest: () => void
  testing: boolean
  testResult: 'idle' | 'success' | 'error'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light text-primary mb-2">
          <Key size={28} />
        </div>
        <h2 className="text-display text-foreground">连接 AI</h2>
        <p className="text-body text-muted-foreground">
          输入你的 OpenAI 兼容 API Key
          <br />它将被加密存储在本地，绝不外传
        </p>
      </div>
      <div className="space-y-3">
        <Input
          type="password"
          placeholder="sk-..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
          }}
          className="glass h-12 text-body rounded-xl px-4"
        />
        <Button
          onClick={onTest}
          disabled={!value || testing}
          variant="outline"
          className="w-full h-11 rounded-xl glass"
        >
          {testing ? (
            <span className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              测试中...
            </span>
          ) : testResult === 'success' ? (
            <span className="flex items-center gap-2 text-success">
              <Check size={18} /> 连接成功
            </span>
          ) : testResult === 'error' ? (
            <span className="flex items-center gap-2 text-destructive">
              连接失败，请检查 Key
            </span>
          ) : (
            '测试连接'
          )}
        </Button>
        <p className="text-micro text-muted-foreground text-center">
          还没有 Key？在{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            platform.openai.com
          </a>{' '}
          创建
        </p>
      </div>
    </motion.div>
  )
}

// ── Step 2: Personal Info ──
function StepPersonalInfo({
  form,
  onChange,
}: {
  form: Record<string, string>
  onChange: (key: string, v: string) => void
}) {
  const fields = [
    { key: 'age', label: '年龄', unit: '岁', placeholder: '25' },
    { key: 'height', label: '身高', unit: 'cm', placeholder: '170' },
    { key: 'weight', label: '当前体重', unit: 'kg', placeholder: '70' },
    { key: 'targetWeight', label: '目标体重', unit: 'kg', placeholder: '65' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light text-primary mb-2">
          <User size={28} />
        </div>
        <h2 className="text-display text-foreground">基本信息</h2>
        <p className="text-body text-muted-foreground">
          这些数据用于计算每日热量预算
        </p>
      </div>
      <div>
        <label className="text-caption text-muted-foreground mb-2 block">性别</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['male', '♂ 男'],
            ['female', '♀ 女'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('gender', value)}
              className={cn(
                'glass py-3 rounded-xl text-body font-medium transition-all duration-200',
                form.gender === value
                  ? 'ring-2 ring-primary bg-primary-light text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {fields.map(({ key, label, unit, placeholder }) => (
        <div key={key}>
          <label className="text-caption text-muted-foreground mb-1.5 block">{label}</label>
          <div className="relative">
            <Input
              type="number"
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="glass h-12 text-body rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">
              {unit}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

// ── Step 3: Diet Framework ──
function StepDietProfile({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  const profiles = getAllDietProfiles()
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light text-primary mb-2">
          <Apple size={28} />
        </div>
        <h2 className="text-display text-foreground">饮食偏好</h2>
        <p className="text-body text-muted-foreground">
          选择适合你的饮食框架，系统将自动调整营养目标
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'glass text-left p-4 rounded-xl transition-all duration-200',
              selected === p.id
                ? 'ring-2 ring-primary bg-primary-light/50'
                : 'hover:shadow-glass-hover'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-body font-semibold text-foreground">{p.name}</div>
                <div className="text-micro text-muted-foreground mt-0.5">{p.description}</div>
                <div className="flex gap-3 mt-2 text-micro text-muted-foreground">
                  <span>蛋白质 {(p.proteinPct * 100).toFixed(0)}%</span>
                  <span>脂肪 {(p.fatPct * 100).toFixed(0)}%</span>
                  <span>碳水 {(p.carbsPct * 100).toFixed(0)}%</span>
                </div>
              </div>
              {selected === p.id && <Check size={20} className="text-primary flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Step 4: Plan ──
function StepPlan({
  plan,
  onConfirm,
  confirming,
}: {
  plan: { budget: number; macros: { protein: number; fat: number; carbs: number }; bmi: number; bmiCategory: string; weeks: number; goal: string } | null
  onConfirm: () => void
  confirming: boolean
}) {
  if (!plan) return null
  const goalLabel = plan.goal === 'lose' ? '减重' : plan.goal === 'gain' ? '增重' : '维持'

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light text-primary mb-2">
          <Sparkles size={28} />
        </div>
        <h2 className="text-display text-foreground">你的专属计划</h2>
        <p className="text-body text-muted-foreground">
          基于你的数据，系统为你生成了个性化方案
        </p>
      </div>
      <GlassCard className="space-y-4">
        <div className="text-center">
          <div className="text-micro text-muted-foreground">每日热量预算</div>
          <div className="text-display text-primary mt-1">{plan.budget} kcal</div>
          <div className="text-caption text-muted-foreground mt-1">
            {goalLabel}计划 · 预计 {plan.weeks} 周达到目标
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-3">
          <div className="text-caption text-muted-foreground">每日营养素目标</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '蛋白质', val: plan.macros.protein, unit: 'g', color: '#f87171' },
              { label: '脂肪', val: plan.macros.fat, unit: 'g', color: '#fbbf24' },
              { label: '碳水', val: plan.macros.carbs, unit: 'g', color: '#60a5fa' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="text-center p-3 glass rounded-xl">
                <div className="text-caption font-semibold" style={{ color }}>
                  {label}
                </div>
                <div className="text-body font-bold text-foreground mt-1">
                  {val}
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-center gap-2 text-caption text-muted-foreground">
          <span>BMI: {plan.bmi}</span>
          <span>·</span>
          <span>{plan.bmiCategory}</span>
        </div>
      </GlassCard>
      <Button onClick={onConfirm} disabled={confirming} className="w-full h-12 rounded-xl text-body">
        {confirming ? (
          <span className="flex items-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
            保存中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles size={18} /> 开始减重之旅
          </span>
        )}
      </Button>
    </motion.div>
  )
}

// ── Main Setup ──

export default function Setup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ gender: 'male', age: '', height: '', weight: '', targetWeight: '' })
  const [dietProfile, setDietProfile] = useState('balanced')
  const [plan, setPlan] = useState<{
    budget: number; macros: { protein: number; fat: number; carbs: number }
    bmi: number; bmiCategory: string; weeks: number; goal: string
  } | null>(null)
  const [confirming, setConfirming] = useState(false)

  const testApiConnection = useCallback(async () => {
    if (!apiKey) return
    setTesting(true)
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      setTestResult(res.ok ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }, [apiKey])

  const goToPlan = useCallback(() => {
    const profile = getDietProfile(dietProfile)
    const w = parseFloat(form.weight) || 70
    const h = parseFloat(form.height) || 170
    const tw = parseFloat(form.targetWeight) || 65
    const a = parseInt(form.age) || 25
    const result = calcDailyBudget({ gender: form.gender as 'male' | 'female', age: a, height: h, weight: w, targetWeight: tw, activityLevel: 'light', weeklyRate: profile.suggestedWeeklyRate })
    const macros = calcMacros(result.dailyBudget, { proteinPct: profile.proteinPct, fatPct: profile.fatPct, carbsPct: profile.carbsPct })
    const bmi = calcBMI(w, h)
    setPlan({ budget: result.dailyBudget, macros, bmi, bmiCategory: bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏重' : '肥胖', weeks: result.estimatedWeeks, goal: result.goal })
    setStep(3)
  }, [form, dietProfile])

  const handleConfirm = useCallback(async () => {
    setConfirming(true)
    try {
      const encryptedKey = apiKey ? await encrypt(apiKey) : null
      await saveSettings({
        apiKeyEncrypted: encryptedKey,
        gender: form.gender as 'male' | 'female',
        age: parseInt(form.age) || 25,
        height: parseFloat(form.height) || 170,
        weight: parseFloat(form.weight) || 70,
        targetWeight: parseFloat(form.targetWeight) || 65,
        dietProfile,
        setupComplete: true,
        dailyCalorieBudget: plan?.budget ?? 2000,
        macroTargets: plan?.macros ?? { protein: 100, fat: 55, carbs: 275 },
      })
      // Save initial weight
      const { addWeightEntry } = await import('@/lib/storage')
      const w = parseFloat(form.weight) || 70
      const h = parseFloat(form.height) || 170
      await addWeightEntry({ date: new Date().toISOString().slice(0, 10), weight: w, bmi: calcBMI(w, h), createdAt: Date.now() })
      navigate('/')
    } catch (err) {
      console.error('Setup failed:', err)
    } finally {
      setConfirming(false)
    }
  }, [apiKey, form, dietProfile, plan, navigate])

  const canNext = () => {
    if (step === 0) return apiKey.length > 10 && testResult === 'success'
    if (step === 1) return form.age && form.height && form.weight && form.targetWeight
    return true
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🥗</div>
        <h1 className="text-display text-foreground">DietTracker</h1>
        <p className="text-body text-muted-foreground mt-1">智能减重助手</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className={cn('w-2.5 h-2.5 rounded-full transition-all duration-300', i === step ? 'bg-primary scale-125' : i < step ? 'bg-primary/40' : 'bg-muted')} />
            <span className={cn('text-micro transition-colors duration-300', i === step ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
          </div>
        ))}
      </div>

      <div className="glass bento-card max-w-md mx-auto w-full relative overflow-hidden min-h-[320px]">
        <AnimatePresence mode="wait">
          {step === 0 && <StepApiKey key="a" value={apiKey} onChange={(v) => { setApiKey(v); setTestResult('idle') }} onTest={testApiConnection} testing={testing} testResult={testResult} />}
          {step === 1 && <StepPersonalInfo key="b" form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />}
          {step === 2 && <StepDietProfile key="c" selected={dietProfile} onSelect={setDietProfile} />}
          {step === 3 && <StepPlan key="d" plan={plan} onConfirm={handleConfirm} confirming={confirming} />}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between max-w-md mx-auto w-full mt-6">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="rounded-xl">
            <ArrowLeft size={18} className="mr-1" /> 上一步
          </Button>
        ) : <div />}
        {step < 3 && (
          <Button onClick={() => (step === 2 ? goToPlan() : setStep((s) => s + 1))} disabled={!canNext()} className="rounded-xl h-11 px-6">
            {step === 2 ? '生成计划' : '下一步'}
            <ArrowRight size={18} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
