/**
 * crypto.ts — Web Crypto API 加解密工具
 *
 * 使用 AES-GCM 对用户 API Key 进行本地加密存储。
 * 密钥存储于 IndexedDB，不可通过 JS 提取（non-extractable）。
 *
 * 修改入口:
 *   - 修改加密算法：修改 algorithm 对象中的 name/length 参数
 */

const ALGORITHM: AesKeyGenParams = { name: 'AES-GCM', length: 256 }
const KEY_STORE = 'diettracker-crypto'
const KEY_NAME = 'encryption-key'

/** 获取或生成加密密钥 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // 尝试从 IndexedDB 恢复
  const stored = await getStoredKey()
  if (stored) return stored

  // 生成新密钥
  const key = await crypto.subtle.generateKey(ALGORITHM, false, [
    'encrypt',
    'decrypt',
  ])
  await storeKey(key)
  return key
}

/** 加密文本 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )

  // 将 IV + 密文合并为 base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/** 解密文本 */
export async function decrypt(encrypted: string): Promise<string | null> {
  try {
    const key = await getEncryptionKey()
    const combined = Uint8Array.from(atob(encrypted), (c) =>
      c.charCodeAt(0)
    )

    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

// ── IndexedDB 密钥持久化 ──

function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(KEY_STORE, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('keys')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function storeKey(key: CryptoKey): Promise<void> {
  const db = await openKeyDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite')
    tx.objectStore('keys').put(key, KEY_NAME)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function getStoredKey(): Promise<CryptoKey | null> {
  const db = await openKeyDB()
  return new Promise((resolve) => {
    const tx = db.transaction('keys', 'readonly')
    const req = tx.objectStore('keys').get(KEY_NAME)
    req.onsuccess = () => {
      db.close()
      resolve(req.result ?? null)
    }
    req.onerror = () => {
      db.close()
      resolve(null)
    }
  })
}
