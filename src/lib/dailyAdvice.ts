/**
 * dailyAdvice.ts — 智能每日点评（纯本地规则引擎）
 *
 * 根据当日饮食摄入 vs 目标、运动量、体重趋势，
 * 生成一条友好的自然语言建议。无 API 调用。
 *
 * 修改入口:
 *   - 新增/修改点评规则：在 generate() 中添加条件分支
 *   - 修改文案：直接改各 advice 数组中的字符串
 */

import type { MacroResult } from './calc'

interface AdviceInput {
  caloriesConsumed: number
  caloriesBudget: number
  macros: MacroResult
  macroTargets: MacroResult
  exerciseMinutes: number
  entriesCount: number
  weightTrend: 'up' | 'down' | 'stable' | 'none'
}

export function generateAdvice(input: AdviceInput): string {
  const { caloriesConsumed, caloriesBudget, macros, macroTargets, exerciseMinutes, entriesCount } = input

  const calPct = caloriesBudget > 0 ? caloriesConsumed / caloriesBudget : 0
  const proteinPct = macroTargets.protein > 0 ? macros.protein / macroTargets.protein : 0
  const fatPct = macroTargets.fat > 0 ? macros.fat / macroTargets.fat : 0
  const carbsPct = macroTargets.carbs > 0 ? macros.carbs / macroTargets.carbs : 0

  const remaining = Math.max(0, caloriesBudget - caloriesConsumed)

  // No entries
  if (entriesCount === 0) {
    const advices = [
      '今天还没记录饮食哦，拍张照开始记录吧 📸',
      '早安！别忘了记录今天的每一餐 🥗',
      '记得吃完后拍照记录，AI 帮你追踪营养',
    ]
    return advices[Math.floor(Math.random() * advices.length)]
  }

  // Over budget
  if (calPct > 1.1) {
    return `今天热量已超出预算 ${Math.round((calPct - 1) * 100)}%，接下来可以选择低热量食物，或者增加一些有氧运动来平衡 🏃`
  }

  // Almost at budget
  if (calPct > 0.85) {
    return `今日剩余 ${remaining}kcal，晚餐可以选择高蛋白低脂的食物，比如鸡胸肉沙拉 🥗`
  }

  // Low protein
  if (proteinPct < 0.6 && calPct > 0.3) {
    const need = Math.round(macroTargets.protein - macros.protein)
    return `蛋白质还差约 ${need}g，晚餐可以加个鸡蛋或一份豆腐 🍳`
  }

  // Low carbs
  if (carbsPct < 0.4 && calPct > 0.3) {
    const need = Math.round(macroTargets.carbs - macros.carbs)
    return `碳水摄入偏少，还差 ${need}g，可以加一份红薯或全麦面包 🍞`
  }

  // High fat
  if (fatPct > 0.8 && caloriesConsumed > 0) {
    return '今天脂肪摄入比例偏高，下一餐可以多选蒸煮的菜品，减少油炸和肥肉 🥦'
  }

  // On track
  if (calPct >= 0.4 && calPct <= 0.7) {
    return `做得不错！目前营养摄入均衡，保持节奏继续加油 💪`
  }

  // Low exercise
  if (exerciseMinutes < 15 && caloriesConsumed > 0) {
    return '今天运动量较少，饭后散步 20 分钟也是很好的选择 🚶'
  }

  // Well balanced
  if (proteinPct >= 0.7 && proteinPct <= 1.2 && fatPct <= 1.0 && carbsPct >= 0.5) {
    return '今天的营养搭配很均衡，继续保持！🎉'
  }

  // Default
  if (calPct < 0.3) {
    return `今日摄入 ${caloriesConsumed}kcal，还有 ${remaining}kcal 剩余，记得按时吃饭，别让自己饿着 😊`
  }

  return `今日摄入 ${caloriesConsumed}kcal，剩余 ${remaining}kcal，继续加油 💪`
}
