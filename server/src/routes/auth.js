import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

router.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password || !displayName) {
    return res.status(400).json({ message: 'Email, password and display name required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const { default: bcrypt } = await import('bcryptjs')
    const password_hash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, 'user'],
    )

    const userId = result.insertId

    await pool.query(
      `INSERT INTO user_profiles (id, display_name, age, online, last_seen)
       VALUES (?, ?, 18, TRUE, NOW())`,
      [userId, displayName],
    )

    const token = jwt.sign({ userId, role: 'user' }, JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({ message: 'Account created', token })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/api/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      await pool.query(
        'UPDATE user_profiles SET online = FALSE, last_seen = NOW() WHERE id = ?',
        [decoded.userId],
      )
    } catch {}
  }
  res.json({ message: 'Logged out' })
})

export default router
