import pool from './db.js'

let cache = { words: [], ts: 0 }
const TTL = 60000

export async function getBannedWords() {
  if (Date.now() - cache.ts < TTL && cache.words.length > 0) return cache.words
  try {
    const [[row]] = await pool.query('SELECT banned_words FROM content_config WHERE id = 1')
    if (row?.banned_words) {
      const words = typeof row.banned_words === 'string' ? JSON.parse(row.banned_words) : row.banned_words
      cache = { words: Array.isArray(words) ? words : [], ts: Date.now() }
    }
  } catch {}
  return cache.words
}

export function containsBannedWord(text, bannedWords) {
  if (!text || bannedWords.length === 0) return false
  const lower = text.toLowerCase()
  return bannedWords.some(w => w && lower.includes(w.toLowerCase()))
}
