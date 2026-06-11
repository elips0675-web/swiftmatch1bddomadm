import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './db.js'

import adminDashboard from './routes/admin/dashboard.js'
import adminUsers from './routes/admin/users.js'
import adminAnalytics from './routes/admin/analytics.js'
import adminReports from './routes/admin/reports.js'
import adminContent from './routes/admin/content.js'
import adminFeatures from './routes/admin/features.js'
import adminMessaging from './routes/admin/messaging.js'
import adminMonetization from './routes/admin/monetization.js'
import profileRoutes from './routes/profile.js'
import uploadRoutes from './routes/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

async function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const [rows] = await pool.query(
      'SELECT id, role FROM users WHERE id = ? AND role = ? AND is_active = 1',
      [decoded.userId, 'admin'],
    )
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    req.admin = rows[0]
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, role, password_hash FROM users WHERE email = ? AND is_active = 1',
      [email],
    )
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = rows[0]
    const { default: bcrypt } = await import('bcryptjs')
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, role: user.role })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Public content endpoint (no auth)
app.get('/api/content', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM content_config WHERE id = 1')
    if (!row) return res.json({ interests: [], dating_goals: [], education: [], banned_words: [], cities: [] })
    function parseJsonField(val, fallback) {
      if (Array.isArray(val)) return val
      if (typeof val === 'string') { try { return JSON.parse(val) } catch { return fallback || [] } }
      return fallback || []
    }
    const [cities] = await pool.query(
      'SELECT DISTINCT city FROM user_profiles WHERE city IS NOT NULL AND city != "" ORDER BY city',
    )
    res.json({
      interests: parseJsonField(row.interests, []),
      dating_goals: parseJsonField(row.dating_goals, []),
      education: parseJsonField(row.education, []),
      banned_words: parseJsonField(row.banned_words, []),
      cities: cities.map(c => c.city),
    })
  } catch (err) {
    console.error('Public content error:', err)
    res.status(500).json({ message: 'Failed to fetch content' })
  }
})

app.use(profileRoutes)
app.use(uploadRoutes)

app.use('/api/admin', adminAuth)

app.get('/api/admin/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' })
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    const [rows] = await pool.query(
      'SELECT u.id, u.role, up.display_name as name, u.email FROM users u LEFT JOIN user_profiles up ON u.id = up.id WHERE u.id = ?',
      [decoded.userId],
    )
    if (rows.length === 0) return res.status(401).json({ message: 'User not found' })
    res.json(rows[0])
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

app.use('/api/admin', adminDashboard)
app.use('/api/admin', adminUsers)
app.use('/api/admin', adminAnalytics)
app.use('/api/admin', adminReports)
app.use('/api/admin', adminContent)
app.use('/api/admin', adminFeatures)
app.use('/api/admin', adminMessaging)
app.use('/api/admin', adminMonetization)

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`SwiftMatch API running on port ${PORT}`)
})
