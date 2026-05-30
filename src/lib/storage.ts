/**
 * storage.ts — IndexedDB 数据访问层
 *
 * 使用 idb 库提供 Promise 化的 IndexedDB 操作。
 * 数据库：diettracker-db，版本 1
 *
 * Store:
 *   - settings: 用户设置（API Key、个人信息、饮食框架等）
 *   - foodLog: 饮食日志
 *   - exerciseLog: 运动日志
 *   - weightLog: 体重日志
 *   - apiUsage: API 调用计数
 *
 * 修改入口:
 *   - 新增数据表：增加 store name 在 upgrade 中
 *   - 修改字段：不影响现有数据，注意版本号递增
 */

import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'diettracker-db'
const DB_VERSION = 1

// ── 类型定义 ──

/** 用户设置 */
export interface UserSettings {
  id: 'user-settings'
  apiKeyEncrypted: string | null
  gender: 'male' | 'female'
  age: number
  height: number // cm
  weight: number // kg
  targetWeight: number // kg
  dietProfile: string // 'balanced' | 'lowcarb' | 'highprotein' | 'keto'
  setupComplete: boolean
  dailyCalorieBudget: number
  macroTargets: { protein: number; fat: number; carbs: number } // grams
  apiEndpoint: string // OpenAI 兼容 API 端点
  visionModel: string // 视觉识别模型名
  parseModel: string // 文本解析模型名
  createdAt: number
  updatedAt: number
}

/** 饮食记录条目 */
export interface FoodEntry {
  id?: number
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  portion: string
  confidence?: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  imageBase64?: string
  createdAt: number
}

/** 每日饮食日志 */
export interface FoodLog {
  id?: number
  date: string // YYYY-MM-DD
  entries: FoodEntry[]
  createdAt: number
  updatedAt: number
}

/** 运动记录 */
export interface ExerciseEntry {
  id?: number
  name: string
  met: number
  duration: number // 分钟
  caloriesBurned: number
  createdAt: number
}

/** 每日运动日志 */
export interface ExerciseLog {
  id?: number
  date: string
  entries: ExerciseEntry[]
  createdAt: number
  updatedAt: number
}

/** 体重记录 */
export interface WeightEntry {
  id?: number
  date: string
  weight: number // kg
  bmi: number
  createdAt: number
}

/** API 调用计数 */
export interface ApiUsage {
  id: 'api-usage'
  daily: number
  monthly: number
  dailyLimit: number
  lastResetDate: string
  lastResetMonth: string
}

// ── 数据库连接 ──

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 用户设置
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
        // 饮食日志
        if (!db.objectStoreNames.contains('foodLog')) {
          const store = db.createObjectStore('foodLog', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('date', 'date', { unique: false })
        }
        // 运动日志
        if (!db.objectStoreNames.contains('exerciseLog')) {
          const store = db.createObjectStore('exerciseLog', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('date', 'date', { unique: false })
        }
        // 体重日志
        if (!db.objectStoreNames.contains('weightLog')) {
          const store = db.createObjectStore('weightLog', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('date', 'date', { unique: false })
        }
        // API 调用计数
        if (!db.objectStoreNames.contains('apiUsage')) {
          db.createObjectStore('apiUsage', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// ── 设置操作 ──

const DEFAULT_SETTINGS: UserSettings = {
  id: 'user-settings',
  apiKeyEncrypted: null,
  gender: 'male',
  age: 25,
  height: 170,
  weight: 70,
  targetWeight: 65,
  dietProfile: 'balanced',
  setupComplete: false,
  dailyCalorieBudget: 2000,
  macroTargets: { protein: 100, fat: 55, carbs: 275 },
  apiEndpoint: 'https://api.openai.com/v1',
  visionModel: 'gpt-4o',
  parseModel: 'gpt-4o-mini',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export async function saveSettings(
  partial: Partial<UserSettings>
): Promise<UserSettings> {
  const db = await getDB()
  const existing = await db.get('settings', 'user-settings')
  const current = existing ?? DEFAULT_SETTINGS
  const merged: UserSettings = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
  }
  await db.put('settings', merged)
  return merged
}

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB()
  const result = await db.get('settings', 'user-settings')
  return result ?? DEFAULT_SETTINGS
}

// ── 饮食日志操作 ──

export async function getTodayFoodLog(): Promise<FoodLog | null> {
  const today = new Date().toISOString().slice(0, 10)
  const db = await getDB()
  const all = await db.getAllFromIndex('foodLog', 'date', today)
  return all[0] ?? null
}

export async function saveFoodLog(log: FoodLog): Promise<IDBValidKey> {
  const db = await getDB()
  return db.put('foodLog', log)
}

export async function getFoodLogs(
  from: string,
  to: string
): Promise<FoodLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('foodLog', 'date', IDBKeyRange.bound(from, to))
}

// ── 运动日志操作 ──

export async function getTodayExerciseLog(): Promise<ExerciseLog | null> {
  const today = new Date().toISOString().slice(0, 10)
  const db = await getDB()
  const all = await db.getAllFromIndex('exerciseLog', 'date', today)
  return all[0] ?? null
}

export async function saveExerciseLog(
  log: ExerciseLog
): Promise<IDBValidKey> {
  const db = await getDB()
  return db.put('exerciseLog', log)
}

export async function getExerciseLogs(
  from: string,
  to: string
): Promise<ExerciseLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('exerciseLog', 'date', IDBKeyRange.bound(from, to))
}

// ── 体重日志操作 ──

export async function addWeightEntry(entry: WeightEntry): Promise<IDBValidKey> {
  const db = await getDB()
  return db.add('weightLog', entry)
}

export async function getWeightEntries(
  from: string,
  to: string
): Promise<WeightEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('weightLog', 'date', IDBKeyRange.bound(from, to))
}

// ── API 用量操作 ──

export async function getApiUsage(): Promise<ApiUsage> {
  const db = await getDB()
  const usage = await db.get('apiUsage', 'api-usage')
  const today = new Date().toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)

  if (!usage) {
    const initial: ApiUsage = {
      id: 'api-usage',
      daily: 0,
      monthly: 0,
      dailyLimit: 20,
      lastResetDate: today,
      lastResetMonth: month,
    }
    await db.put('apiUsage', initial)
    return initial
  }

  // 日重置
  if (usage.lastResetDate !== today) {
    usage.daily = 0
    usage.lastResetDate = today
  }
  // 月重置
  if (usage.lastResetMonth !== month) {
    usage.monthly = 0
    usage.lastResetMonth = month
  }

  await db.put('apiUsage', usage)
  return usage
}

export async function incrementApiUsage(): Promise<ApiUsage> {
  const usage = await getApiUsage()
  usage.daily++
  usage.monthly++
  const db = await getDB()
  await db.put('apiUsage', usage)
  return usage
}

export async function setDailyLimit(limit: number): Promise<void> {
  const usage = await getApiUsage()
  usage.dailyLimit = limit
  const db = await getDB()
  await db.put('apiUsage', usage)
}

// ── 数据导出/导入 ──

export async function exportAllData(): Promise<Record<string, unknown>> {
  const db = await getDB()
  const storeNames = Array.from(db.objectStoreNames)

  const data: Record<string, unknown> = {}
  for (const name of storeNames) {
    data[name] = await db.getAll(name)
  }
  return data
}

export async function importAllData(
  data: Record<string, unknown[]>
): Promise<void> {
  const db = await getDB()

  for (const [storeName, records] of Object.entries(data)) {
    if (!db.objectStoreNames.contains(storeName)) continue
    const tx = db.transaction(storeName, 'readwrite')
    for (const record of records) {
      await tx.store.put(record)
    }
    await tx.done
  }
}
