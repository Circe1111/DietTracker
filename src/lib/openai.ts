/**
 * openai.ts — OpenAI 兼容 API 调用工具
 *
 * 所有调用由前端直接发起，使用用户本地存储的 API Key。
 * 自动处理加密解密、用量计数、错误处理。
 *
 * 修改入口:
 *   - API_ENDPOINT: 修改为兼容服务端点（如 Azure、Ollama 等）
 *   - 识别 Prompt: 修改 VISION_PROMPT / PARSE_PROMPT 文案
 *   - MAX_RETRIES: 修改重试次数
 */

import { decrypt } from './crypto'
import { getSettings, incrementApiUsage, getApiUsage } from './storage'

/** OpenAI 兼容 API 端点 */
const API_ENDPOINT = 'https://api.openai.com/v1'

const VISION_MODEL = 'gpt-4o'
const PARSE_MODEL = 'gpt-4o-mini'
const MAX_RETRIES = 2

/** 食物识别返回结构 */
export interface FoodRecognition {
  name: string
  confidence: number
  calories: number
  protein: number
  fat: number
  carbs: number
  portion: string
}

/** 配料表解析返回结构 */
export interface IngredientParse {
  name: string
  calories: number // per 100g
  protein: number
  fat: number
  carbs: number
}

// ── 内部工具 ──

async function getDecryptedKey(): Promise<string> {
  const settings = await getSettings()
  if (!settings.apiKeyEncrypted) {
    throw new Error('API Key 未设置，请前往设置页面配置')
  }
  const key = await decrypt(settings.apiKeyEncrypted)
  if (!key) throw new Error('API Key 解密失败，请重新设置')
  return key
}

async function callOpenAI(
  messages: { role: string; content: unknown }[],
  model: string,
  maxTokens = 1000
): Promise<string> {
  const apiKey = await getDecryptedKey()

  // 检查日用量限制
  const usage = await getApiUsage()
  if (usage.daily >= usage.dailyLimit) {
    throw new Error(`今日 API 调用已达上限（${usage.dailyLimit} 次），请明日再试或调整限额`)
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_ENDPOINT}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        if (res.status === 401) throw new Error('API Key 无效，请检查设置')
        if (res.status === 429) throw new Error('API 请求过于频繁，请稍后重试')
        if (res.status === 402) throw new Error('API 额度已用完，请充值')
        throw new Error(`API 错误 ${res.status}: ${errBody.slice(0, 200)}`)
      }

      const json = await res.json()
      const content = json.choices?.[0]?.message?.content

      if (!content) throw new Error('API 返回内容为空')

      // 记录用量
      await incrementApiUsage()

      return content
    } catch (err) {
      lastError = err as Error
      if (attempt < MAX_RETRIES) {
        // 等待后重试
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError ?? new Error('API 调用失败')
}

// ── 提取 JSON ──

function extractJSON(text: string): unknown {
  // 尝试直接解析
  try {
    return JSON.parse(text)
  } catch {
    // 尝试提取 ```json ... ``` 代码块
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (block) {
      try {
        return JSON.parse(block[1].trim())
      } catch {
        // fall through
      }
    }
    // 尝试提取 { ... } 对象
    const obj = text.match(/\{[\s\S]*\}/)
    if (obj) {
      try {
        return JSON.parse(obj[0])
      } catch {
        // fall through
      }
    }
  }
  throw new Error('无法解析 AI 返回的数据，请重试')
}

// ── 公开 API ──

/**
 * 拍照识别食物
 * @param base64Image - 图片的 base64 数据（不含 data:image 前缀）
 */
export async function recognizeFood(base64Image: string): Promise<FoodRecognition> {
  const content = await callOpenAI(
    [
      {
        role: 'system',
        content:
          '你是一个专业的食物营养分析师。请根据图片识别食物，返回 JSON 格式的营养数据。只返回 JSON，不要其他文字。',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '分析这张食物图片，返回以下 JSON 格式数据：\n\n{\n  "name": "食物中文名称",\n  "confidence": 0.95,\n  "calories": 250,\n  "protein": 30,\n  "fat": 10,\n  "carbs": 15,\n  "portion": "约200g"\n}\n\n只返回 JSON，不要其他内容。',
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' },
          },
        ],
      },
    ],
    VISION_MODEL,
    500
  )

  const json = extractJSON(content) as Record<string, unknown>

  return {
    name: String(json.name ?? '未知食物'),
    confidence: Number(json.confidence ?? 0.5),
    calories: Math.round(Number(json.calories ?? 0)),
    protein: Math.round(Number(json.protein ?? 0)),
    fat: Math.round(Number(json.fat ?? 0)),
    carbs: Math.round(Number(json.carbs ?? 0)),
    portion: String(json.portion ?? '1份'),
  }
}

/**
 * 解析配料表
 * @param ingredientsText - 用户输入的配料表文本
 */
export async function parseIngredients(
  ingredientsText: string
): Promise<IngredientParse> {
  const content = await callOpenAI(
    [
      {
        role: 'system',
        content:
          '你是一个专业的食品营养分析师。请根据配料表估算每100g的营养成分。只返回 JSON，不要其他文字。',
      },
      {
        role: 'user',
        content: `根据以下配料表，估算每100g的营养成分，返回 JSON：\n\n{\n  "name": "食物名称",\n  "calories": 200,\n  "protein": 10,\n  "fat": 8,\n  "carbs": 25\n}\n\n配料表：\n${ingredientsText}`,
      },
    ],
    PARSE_MODEL,
    500
  )

  const json = extractJSON(content) as Record<string, unknown>

  return {
    name: String(json.name ?? '未知食物'),
    calories: Math.round(Number(json.calories ?? 0)),
    protein: Math.round(Number(json.protein ?? 0)),
    fat: Math.round(Number(json.fat ?? 0)),
    carbs: Math.round(Number(json.carbs ?? 0)),
  }
}

/**
 * 检查 API Key 是否有效
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_ENDPOINT}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    return res.ok
  } catch {
    return false
  }
}
