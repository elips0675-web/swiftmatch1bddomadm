import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

function getUserFromToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
  } catch {
    return null
  }
}

router.post('/api/reports', async (req, res) => {
  const decoded = getUserFromToken(req)
  if (!decoded) return res.status(401).json({ message: 'Authentication required' })

  const { reported_id, reason, description } = req.body
  if (!reported_id || !reason) {
    return res.status(400).json({ message: 'reported_id and reason are required' })
  }

  try {
    const [target] = await pool.query('SELECT id FROM users WHERE id = ?', [reported_id])
    if (target.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    await pool.query(
      'INSERT INTO reports (reporter_id, reported_id, reason, description) VALUES (?, ?, ?, ?)',
      [decoded.userId, reported_id, reason, description || null],
    )

    res.status(201).json({ message: 'Report submitted' })
  } catch (err) {
    console.error('Report error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
