/**
 * calc.ts — 热量与营养计算规则引擎
 *
 * 基于 Mifflin-St Jeor 公式计算 BMR，根据活动水平估算 TDEE。
 * 减重/增重/维持预算根据目标体重差和速率计算。
 *
 * 修改入口:
 *   - 修改 activityLevel 的 PAL 系数
 *   - 修改 weeklyRate 调整减重速度
 *   - 修改宏量比例计算逻辑
 *
 * 参考:
 *   - Mifflin-St Jeor Equation (1990)
 *   - WHO Protein Requirements
 */

/** 减重速度 (kg/week) 对应的每日热量缺口 (kcal) */
const KCAL_PER_KG = 7700

/** 活动水平 → PAL (Physical Activity Level) 系数 */
const ACTIVITY_PAL: Record<string, number> = {
  sedentary: 1.2,    // 久坐不动
  light: 1.375,      // 轻度活动（每周 1-3 天）
  moderate: 1.55,    // 中度活动（每周 3-5 天）
  active: 1.725,     // 高强度活动（每周 6-7 天）
  extreme: 1.9,       // 极高强度（体力劳动者 + 每日训练）
}

/** 目标体重变化方向 */
export type WeightGoal = 'lose' | 'maintain' | 'gain'

/** 用户参数 */
export interface UserParams {
  gender: 'male' | 'female'
  age: number
  height: number // cm
  weight: number // kg
  targetWeight: number // kg
  activityLevel: string
  weeklyRate: number // 预期每周变化 kg（减重取正，增重取负）
}

/** 计算结果 */
export interface CalcResult {
  bmr: number
  tdee: number
  dailyBudget: number
  weeklyRate: number
  goal: WeightGoal
  deficit: number // 正数 = 热量缺口
  estimatedWeeks: number
}

/**
 * 计算 BMR (Mifflin-St Jeor 公式)
 */
export function calcBMR(gender: 'male' | 'female', age: number, height: number, weight: number): number {
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

/**
 * 计算 TDEE
 */
export function calcTDEE(bmr: number, activityLevel: string): number {
  const pal = ACTIVITY_PAL[activityLevel] ?? 1.2
  return Math.round(bmr * pal)
}

/**
 * 计算每日热量预算
 */
export function calcDailyBudget(params: UserParams): CalcResult {
  const { gender, age, height, weight, targetWeight, activityLevel, weeklyRate } = params

  const bmr = calcBMR(gender, age, height, weight)
  const tdee = calcTDEE(bmr, activityLevel)

  const diff = weight - targetWeight
  let goal: WeightGoal = 'maintain'
  if (diff > 1) goal = 'lose'
  else if (diff < -1) goal = 'gain'

  // 每日热量缺口
  const dailyDeficit = Math.round((weeklyRate * KCAL_PER_KG) / 7)
  const deficit = goal === 'lose' ? dailyDeficit : goal === 'gain' ? -dailyDeficit : 0

  // 每日预算 = TDEE - 缺口
  const dailyBudget = Math.round(tdee - deficit)

  // 估算所需周数
  const estimatedWeeks =
    goal === 'maintain' ? 0 : Math.max(1, Math.ceil(Math.abs(diff) / weeklyRate))

  // 安全下限（男性 1500，女性 1200）
  const floor = gender === 'male' ? 1500 : 1200
  const safeBudget = Math.max(dailyBudget, floor)

  return {
    bmr,
    tdee,
    dailyBudget: safeBudget,
    weeklyRate,
    goal,
    deficit,
    estimatedWeeks,
  }
}

/**
 * 根据饮食框架计算宏量营养素目标（克）
 * 热量分配：蛋白质 4kcal/g，脂肪 9kcal/g，碳水 4kcal/g
 */
export interface MacroResult {
  protein: number // g
  fat: number     // g
  carbs: number   // g
}

export function calcMacros(
  dailyBudget: number,
  profile: { proteinPct: number; fatPct: number; carbsPct: number }
): MacroResult {
  return {
    protein: Math.round((dailyBudget * profile.proteinPct) / 4),
    fat: Math.round((dailyBudget * profile.fatPct) / 9),
    carbs: Math.round((dailyBudget * profile.carbsPct) / 4),
  }
}

/**
 * MET → 消耗热量 (kcal)
 */
export function calcExerciseCalories(
  met: number,
  weight: number, // kg
  durationMinutes: number
): number {
  // MET × 体重(kg) × 时间(h)
  return Math.round(met * weight * (durationMinutes / 60))
}

/**
 * BMI 计算
 */
export function calcBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

/**
 * BMI 分类
 */
export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏重'
  return '肥胖'
}
