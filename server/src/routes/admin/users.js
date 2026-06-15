import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../../db.js'
import { getIO } from '../../ws.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

const router = Router()

router.get('/users', async (req, res) => {
  try {
    const { search, status, city, premium, sort = 'joined', dir = 'desc', page = '1' } = req.query
    const pageSize = 15
    const offset = (Math.max(1, Number(page)) - 1) * pageSize

    let where = ['1=1']
    let params = []

    if (search) {
      where.push('(u.email LIKE ? OR up.display_name LIKE ? OR up.city LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (status && status !== 'all') {
      where.push('u.is_active = ?')
      params.push(status === 'active' ? 1 : 0)
    }
    if (city && city !== 'all') {
      where.push('up.city = ?')
      params.push(city)
    }

    const allowedSort = { name: 'up.display_name', joined: 'u.created_at', age: 'up.age' }
    const sortCol = allowedSort[sort] || 'u.created_at'
    const sortDir = dir === 'asc' ? 'ASC' : 'DESC'

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u
       LEFT JOIN user_profiles up ON u.id = up.id
       WHERE ${where.join(' AND ')}`,
      params,
    )

    const [rows] = await pool.query(
      `SELECT u.id, up.display_name as name, up.age, u.email, up.city,
              CASE WHEN u.is_active = 1 THEN 'active' ELSE 'banned' END as status,
              'free' as premium, u.online as online,
              DATE_FORMAT(u.created_at, '%Y-%m-%d') as joined,
              DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i') as lastActive,
              COALESCE(up.bio, '') as bio
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.id
       WHERE ${where.join(' AND ')}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    )

    const [[{ cities }]] = await pool.query(
      `SELECT JSON_ARRAYAGG(DISTINCT city) as cities
       FROM user_profiles WHERE city IS NOT NULL AND city != ''`,
    )

    res.json({ users: rows, total, cities: JSON.parse(cities || '[]') })
  } catch (err) {
    console.error('Users list error:', err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, up.display_name as name, up.age, u.email, up.city,
              CASE WHEN u.is_active = 1 THEN 'active' ELSE 'banned' END as status,
              'free' as premium, up.bio,
              DATE_FORMAT(u.created_at, '%Y-%m-%d') as joined,
              DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i') as lastActive,
              (SELECT COUNT(*) FROM matches WHERE user1_id = u.id OR user2_id = u.id) as matchesCount,
              (SELECT COUNT(*) FROM reports WHERE reported_id = u.id) as reportsCount
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.id
       WHERE u.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('User detail error:', err)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

router.post('/users/:id/ban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id])
    await pool.query(
      'INSERT INTO moderation_log (admin_id, target_user_id, action, reason) VALUES (?, ?, ?, ?)',
      [req.admin.id, req.params.id, 'ban', req.body.reason || 'No reason'],
    )
    const io = getIO()
    if (io) io.to(`user:${req.params.id}`).emit('user:banned', { reason: req.body.reason })
    res.json({ message: 'User banned' })
  } catch (err) {
    console.error('Ban error:', err)
    res.status(500).json({ message: 'Failed to ban user' })
  }
})

router.post('/users/:id/unban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [req.params.id])
    res.json({ message: 'User unbanned' })
  } catch (err) {
    console.error('Unban error:', err)
    res.status(500).json({ message: 'Failed to unban user' })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

router.post('/users/bulk', async (req, res) => {
  const { ids, action } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' })
  }
  try {
    if (action === 'delete') {
      await pool.query(`DELETE FROM users WHERE id IN (?)`, [ids])
    } else if (action === 'ban') {
      await pool.query(`UPDATE users SET is_active = 0 WHERE id IN (?)`, [ids])
    } else if (action === 'suspend') {
      await pool.query(`UPDATE users SET is_active = 0 WHERE id IN (?)`, [ids])
    }
    res.json({ message: `Bulk ${action} completed` })
  } catch (err) {
    console.error('Bulk action error:', err)
    res.status(500).json({ message: 'Failed to perform bulk action' })
  }
})

router.post('/users', async (req, res) => {
  const { email, password, name, age, city, gender } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
  try {
    const { default: bcrypt } = await import('bcryptjs')
    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [email, hash, 'user'],
    )
    const userId = result.insertId
    if (name || age || city || gender) {
      await pool.query(
        'INSERT INTO user_profiles (id, display_name, age, city, gender) VALUES (?, ?, ?, ?, ?)',
        [userId, name || email, age || 18, city || '', gender || 'male'],
      )
    }
    res.json({ id: userId, email, message: 'User created' })
  } catch (err) {
    console.error('Create user error:', err)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' })
    }
    res.status(500).json({ message: 'Failed to create user' })
  }
})

router.post('/users/:id/reset-password', async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters' })
  }
  try {
    const { default: bcrypt } = await import('bcryptjs')
    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id])
    res.json({ message: 'Password updated' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: 'Failed to reset password' })
  }
})

// ─── Activity log ──────────────────────────────────────────────
router.get('/users/:id/activity', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT al.id, al.action_type, al.target_id, al.metadata, al.created_at
       FROM activity_log al
       WHERE al.user_id = ?
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [req.params.id],
    )
    res.json(rows)
  } catch (err) {
    console.error('Activity log error:', err)
    res.status(500).json({ message: 'Failed to fetch activity' })
  }
})

// ─── Impersonation ─────────────────────────────────────────────
router.post('/users/:id/impersonate', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' })

    const token = jwt.sign(
      { userId: rows[0].id, role: 'user', impersonator: req.admin?.id },
      JWT_SECRET,
      { expiresIn: '1h' },
    )
    res.json({ token, user: rows[0] })
  } catch (err) {
    console.error('Impersonation error:', err)
    res.status(500).json({ message: 'Failed to impersonate' })
  }
})

export default router
