import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'Auth required' })
  try {
    req.userId = jwt.verify(header.split(' ')[1], JWT_SECRET).userId
    next()
  } catch { return res.status(401).json({ message: 'Invalid token' }) }
}

const TIERS = [
  { id: 'plus', name: 'Plus', price: 299, duration_months: 1, features: ['5 суперлайков в день', 'Без рекламы', 'Кто лайкнул меня'] },
  { id: 'gold', name: 'Gold', price: 699, duration_months: 1, features: ['10 суперлайков в день', 'Без рекламы', 'Кто лайкнул меня', 'Режим невидимки', 'Приоритетные лайки'] },
  { id: 'platinum', name: 'Platinum', price: 1499, duration_months: 1, features: ['∞ суперлайков', 'Без рекламы', 'Кто лайкнул меня', 'Режим невидимки', 'Приоритетные лайки', 'Персональный консьерж'] },
]

router.get('/api/premium/tiers', (req, res) => {
  res.json(TIERS)
})

router.get('/api/premium/my', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT tier, duration_months, price, started_at, expires_at, is_active FROM subscriptions WHERE user_id = ? AND is_active = 1 AND expires_at > NOW() ORDER BY started_at DESC LIMIT 1",
      [req.userId],
    )
    if (rows.length === 0) return res.json(null)
    res.json(rows[0])
  } catch (err) {
    console.error('Premium check error:', err)
    res.status(500).json({ message: 'Failed to check premium status' })
  }
})

router.post('/api/premium/purchase', auth, async (req, res) => {
  const { tier, duration_months } = req.body
  if (!tier || !duration_months) return res.status(400).json({ message: 'tier and duration_months are required' })

  const tierConfig = TIERS.find(t => t.id === tier)
  if (!tierConfig) return res.status(400).json({ message: 'Invalid tier' })

  const price = tierConfig.price * duration_months

  try {
    await pool.query(
      `INSERT INTO subscriptions (user_id, tier, duration_months, price, expires_at, is_active)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MONTH), 1)`,
      [req.userId, tier, duration_months, price, duration_months],
    )

    res.status(201).json({ message: 'Subscription activated', tier, expires_at: null })
  } catch (err) {
    console.error('Purchase error:', err)
    res.status(500).json({ message: 'Failed to process purchase' })
  }
})

export default router
