/**
 * dietProfiles.ts — 饮食框架宏量营养素配比
 *
 * 每种框架定义了蛋白质/脂肪/碳水的热量占比。
 * 用户选择框架后，系统根据每日热量预算计算克数目标。
 *
 * 修改入口:
 *   - 新增饮食框架：在 DIET_PROFILES 中添加
 *   - 修改比例：调整 proteinPct/fatPct/carbsPct（三者和必须为 1）
 *   - 修改描述文本直接改 description 字段
 *
 * 参考:
 *   - Acceptable Macronutrient Distribution Ranges (AMDR)
 *   - Protein: 10-35%, Fat: 20-35%, Carbs: 45-65%
 */

export interface DietProfile {
  id: string
  name: string
  description: string
  proteinPct: number
  fatPct: number
  carbsPct: number
  emoji: string
  /** 推荐周减重速率 (kg) */
  suggestedWeeklyRate: number
}

export const DIET_PROFILES: Record<string, DietProfile> = {
  balanced: {
    id: 'balanced',
    name: '均衡饮食',
    description: '蛋白质、脂肪、碳水均衡摄入，适合大多数人群长期坚持',
    proteinPct: 0.25,
    fatPct: 0.25,
    carbsPct: 0.50,
    emoji: '🥗',
    suggestedWeeklyRate: 0.5,
  },
  lowcarb: {
    id: 'lowcarb',
    name: '低碳水',
    description: '减少碳水摄入，增加蛋白质和脂肪比例，适合需要控糖的人群',
    proteinPct: 0.30,
    fatPct: 0.40,
    carbsPct: 0.30,
    emoji: '🥩',
    suggestedWeeklyRate: 0.5,
  },
  highprotein: {
    id: 'highprotein',
    name: '高蛋白',
    description: '高蛋白比例，帮助维持肌肉量，适合配合力量训练',
    proteinPct: 0.35,
    fatPct: 0.25,
    carbsPct: 0.40,
    emoji: '🍗',
    suggestedWeeklyRate: 0.5,
  },
  keto: {
    id: 'keto',
    name: '生酮饮食',
    description: '极低碳水、高脂肪，诱导身体进入酮症状态燃烧脂肪',
    proteinPct: 0.20,
    fatPct: 0.70,
    carbsPct: 0.10,
    emoji: '🥑',
    suggestedWeeklyRate: 0.75,
  },
}

/** 获取饮食框架 */
export function getDietProfile(id: string): DietProfile {
  return DIET_PROFILES[id] ?? DIET_PROFILES.balanced
}

/** 所有框架的列表 */
export function getAllDietProfiles(): DietProfile[] {
  return Object.values(DIET_PROFILES)
}
