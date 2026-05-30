/**
 * exercises.ts — 运动项目库（MET 值）
 *
 * MET (Metabolic Equivalent of Task) 值来源于《2011 Compendium of Physical Activities》
 * 1 MET = 静息代谢率（约 1 kcal/kg/h）
 *
 * 消耗热量(kcal) = MET × 体重(kg) × 时长(h)
 *
 * 修改入口：
 *   - 新增运动：在对应分类数组中添加对象
 *   - 修改 MET 值：直接改各条目的 met 字段
 */

export interface ExerciseItem {
  id: string
  name: string
  met: number
  category: string
  emoji: string
}

export const EXERCISE_CATEGORIES = ['有氧', '力量', '柔韧', '球类', '日常', '其他'] as const

export const EXERCISES: ExerciseItem[] = [
  // ── 有氧 ──
  { id: 'walking', name: '慢走', met: 3.0, category: '有氧', emoji: '🚶' },
  { id: 'brisk-walking', name: '快走', met: 4.3, category: '有氧', emoji: '🚶‍➡️' },
  { id: 'running-slow', name: '慢跑', met: 6.0, category: '有氧', emoji: '🏃' },
  { id: 'running', name: '跑步 (8km/h)', met: 8.0, category: '有氧', emoji: '🏃' },
  { id: 'running-fast', name: '快跑 (12km/h)', met: 12.0, category: '有氧', emoji: '🏃‍➡️' },
  { id: 'cycling', name: '骑行 (16km/h)', met: 5.5, category: '有氧', emoji: '🚴' },
  { id: 'cycling-fast', name: '骑行 (22km/h)', met: 8.0, category: '有氧', emoji: '🚴' },
  { id: 'swimming', name: '游泳 (慢速)', met: 6.0, category: '有氧', emoji: '🏊' },
  { id: 'swimming-fast', name: '游泳 (快速)', met: 10.0, category: '有氧', emoji: '🏊' },
  { id: 'aerobics', name: '健身操', met: 6.5, category: '有氧', emoji: '💃' },
  { id: 'jump-rope', name: '跳绳 (慢速)', met: 8.0, category: '有氧', emoji: '🪢' },
  { id: 'jump-rope-fast', name: '跳绳 (快速)', met: 12.0, category: '有氧', emoji: '🪢' },
  { id: 'elliptical', name: '椭圆机', met: 5.0, category: '有氧', emoji: '🔄' },
  { id: 'stair-climb', name: '爬楼梯', met: 8.0, category: '有氧', emoji: '🪜' },

  // ── 力量 ──
  { id: 'weight-training', name: '力量训练 (中强度)', met: 5.0, category: '力量', emoji: '🏋️' },
  { id: 'weight-training-heavy', name: '力量训练 (高强度)', met: 6.0, category: '力量', emoji: '🏋️' },
  { id: 'squats', name: '深蹲', met: 5.0, category: '力量', emoji: '🦵' },
  { id: 'pushups', name: '俯卧撑', met: 3.8, category: '力量', emoji: '💪' },
  { id: 'situps', name: '仰卧起坐', met: 3.8, category: '力量', emoji: '🔄' },
  { id: 'plank', name: '平板支撑', met: 2.5, category: '力量', emoji: '🧘' },

  // ── 柔韧 ──
  { id: 'yoga', name: '瑜伽', met: 2.5, category: '柔韧', emoji: '🧘' },
  { id: 'yoga-power', name: '力量瑜伽', met: 4.0, category: '柔韧', emoji: '🧘' },
  { id: 'stretching', name: '拉伸', met: 2.3, category: '柔韧', emoji: '🤸' },
  { id: 'pilates', name: '普拉提', met: 3.0, category: '柔韧', emoji: '🤸‍♀️' },
  { id: 'tai-chi', name: '太极拳', met: 3.0, category: '柔韧', emoji: '☯️' },

  // ── 球类 ──
  { id: 'basketball', name: '篮球', met: 6.5, category: '球类', emoji: '🏀' },
  { id: 'football', name: '足球', met: 7.0, category: '球类', emoji: '⚽' },
  { id: 'badminton', name: '羽毛球', met: 5.5, category: '球类', emoji: '🏸' },
  { id: 'table-tennis', name: '乒乓球', met: 4.0, category: '球类', emoji: '🏓' },
  { id: 'tennis', name: '网球', met: 7.0, category: '球类', emoji: '🎾' },
  { id: 'volleyball', name: '排球', met: 4.0, category: '球类', emoji: '🏐' },

  // ── 日常 ──
  { id: 'housework', name: '家务', met: 3.0, category: '日常', emoji: '🧹' },
  { id: 'gardening', name: '园艺', met: 3.8, category: '日常', emoji: '🌱' },
  { id: 'dancing', name: '跳舞', met: 5.0, category: '日常', emoji: '💃' },

  // ── 其他 ──
  { id: 'hiking', name: '徒步登山', met: 5.3, category: '其他', emoji: '🥾' },
  { id: 'skating', name: '滑冰/轮滑', met: 7.0, category: '其他', emoji: '⛸️' },
  { id: 'martial-arts', name: '武术/格斗', met: 10.0, category: '其他', emoji: '🥋' },
]

/** 获取默认快捷运动 */
export const QUICK_EXERCISES = EXERCISES.filter((e) =>
  ['walking', 'running', 'aerobics'].includes(e.id)
)

/** 按分类分组 */
export function getExercisesByCategory(): Record<string, ExerciseItem[]> {
  const groups: Record<string, ExerciseItem[]> = {}
  for (const cat of EXERCISE_CATEGORIES) {
    groups[cat] = EXERCISES.filter((e) => e.category === cat)
  }
  return groups
}

/** 根据 ID 查找 */
export function findExercise(id: string): ExerciseItem | undefined {
  return EXERCISES.find((e) => e.id === id)
}
