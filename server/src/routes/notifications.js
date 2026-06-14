import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

function auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

router.get('/api/notifications', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, payload, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.userId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Notifications error:', err)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

router.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [req.userId],
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    console.error('Read all error:', err)
    res.status(500).json({ message: 'Failed to mark as read' })
  }
})

router.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId],
    )
    res.json({ message: 'Notification marked as read' })
  } catch (err) {
    console.error('Read notification error:', err)
    res.status(500).json({ message: 'Failed to mark notification as read' })
  }
})

export default router
