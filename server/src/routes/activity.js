import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

function auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' })
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }) }
}

router.get('/api/activity', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.action_type, a.metadata, a.created_at,
              up.display_name as user_name, up.avatar_url as user_avatar
       FROM activity_log a
       LEFT JOIN user_profiles up ON a.user_id = up.id
       WHERE a.target_id = ?
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [req.userId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Activity error:', err)
    res.status(500).json({ message: 'Failed to fetch activity' })
  }
})

router.post('/api/activity', auth, async (req, res) => {
  const { action_type, target_id, metadata } = req.body
  if (!action_type) return res.status(400).json({ message: 'action_type is required' })

  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, target_id, action_type, metadata) VALUES (?, ?, ?, ?)',
      [req.userId, target_id || null, action_type, metadata ? JSON.stringify(metadata) : null],
    )
    res.status(201).json({ message: 'Activity logged' })
  } catch (err) {
    console.error('Activity log error:', err)
    res.status(500).json({ message: 'Failed to log activity' })
  }
})

export default router
