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

router.get('/api/profile/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT up.*, u.email FROM user_profiles up
       JOIN users u ON u.id = up.id
       WHERE up.id = ?`,
      [req.userId],
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' })

    const [photos] = await pool.query(
      'SELECT id, url, sort_order, is_avatar FROM user_photos WHERE user_id = ? ORDER BY sort_order',
      [req.userId],
    )
    const [interests] = await pool.query(
      `SELECT i.name_en as slug FROM interests i
       JOIN user_interests ui ON ui.interest_id = i.id
       WHERE ui.user_id = ?`,
      [req.userId],
    )

    res.json({ ...rows[0], photos, interests })
  } catch (err) {
    console.error('Profile me error:', err)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

function parseJsonField(val, fallback) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return fallback || [] } }
  return fallback || []
}

router.get('/api/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT up.*, u.email FROM user_profiles up
       JOIN users u ON u.id = up.id
       WHERE up.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' })

    const [photos] = await pool.query(
      'SELECT id, url, sort_order, is_avatar FROM user_photos WHERE user_id = ? ORDER BY sort_order',
      [req.params.id],
    )
    const [interests] = await pool.query(
      `SELECT i.id, i.name_ru, i.name_en FROM interests i
       JOIN user_interests ui ON ui.interest_id = i.id
       WHERE ui.user_id = ?`,
      [req.params.id],
    )

    res.json({ ...rows[0], photos, interests })
  } catch (err) {
    console.error('Profile GET error:', err)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// Public user profile for discovery pages (user.tsx)
router.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT up.id, up.display_name, up.name, up.age, up.avatar_url,
              up.city, up.bio, up.gender, up.looking_for,
              up.dating_goal, up.height, up.zodiac, up.circadian,
              up.attachment_style, up.education, up.online,
              u.created_at
       FROM user_profiles up
       JOIN users u ON u.id = up.id
       WHERE up.id = ? AND u.is_active = 1`,
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' })

    const [interests] = await pool.query(
      `SELECT i.name_ru FROM interests i
       JOIN user_interests ui ON ui.interest_id = i.id
       WHERE ui.user_id = ?`,
      [req.params.id],
    )

    const [photos] = await pool.query(
      'SELECT url FROM user_photos WHERE user_id = ? ORDER BY sort_order',
      [req.params.id],
    )

    const interestKeys = interests.map(i => i.name_ru)

    res.json({
      ...rows[0],
      interests: interestKeys,
      photos: photos.map(p => p.url),
      img: rows[0].avatar_url,
      goal: rows[0].dating_goal,
      lookingFor: rows[0].looking_for,
      match: Math.floor(Math.random() * 100),
      distance: Math.floor(Math.random() * 50) + 1,
      pollAnswers: null,
      isSystem: false,
    })
  } catch (err) {
    console.error('User GET error:', err)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

router.put('/api/profile/me', auth, async (req, res) => {
  try {
    const { display_name, name, age, bio, gender, looking_for, dating_goal, height, city, country, zodiac, circadian, attachment_style, education, interests } = req.body

    await pool.query(
      `UPDATE user_profiles SET
        display_name = COALESCE(?, display_name),
        name = COALESCE(?, name),
        age = COALESCE(?, age),
        bio = COALESCE(?, bio),
        gender = COALESCE(?, gender),
        looking_for = COALESCE(?, looking_for),
        dating_goal = COALESCE(?, dating_goal),
        height = COALESCE(?, height),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        zodiac = COALESCE(?, zodiac),
        circadian = COALESCE(?, circadian),
        attachment_style = COALESCE(?, attachment_style),
        education = COALESCE(?, education)
      WHERE id = ?`,
      [display_name, name, age, bio, gender, looking_for, dating_goal, height, city, country, zodiac, circadian, attachment_style, education, req.userId],
    )

    if (interests && Array.isArray(interests)) {
      await pool.query('DELETE FROM user_interests WHERE user_id = ?', [req.userId])
      for (const interestId of interests) {
        await pool.query('INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES (?, ?)', [req.userId, interestId])
      }
    }

    const [rows] = await pool.query('SELECT * FROM user_profiles WHERE id = ?', [req.userId])
    res.json(rows[0])
  } catch (err) {
    console.error('Profile PUT error:', err)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

router.get('/api/users/search', async (req, res) => {
  try {
    const { q, age_min, age_max, city, gender, goal, interest, lat, lng, radius, page = '1', limit = '20' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const hasGeo = lat && lng && radius
    const userLat = hasGeo ? parseFloat(lat) : 0
    const userLng = hasGeo ? parseFloat(lng) : 0

    let distanceExpr = hasGeo
      ? `, ROUND(6371 * 2 * ASIN(SQRT(POWER(SIN((RADIANS(${userLat}) - RADIANS(up.lat)) / 2), 2) + COS(RADIANS(${userLat})) * COS(RADIANS(up.lat)) * POWER(SIN((RADIANS(${userLng}) - RADIANS(up.lng)) / 2), 2))), 1) AS distance`
      : ''

    let having = hasGeo ? ` HAVING distance < ${Number(radius)}` : ''

    let sql = `SELECT up.id, up.display_name, up.name, up.age, up.avatar_url, up.city, up.online, up.gender, up.looking_for, up.dating_goal${distanceExpr}
               FROM user_profiles up
               JOIN users u ON u.id = up.id AND u.is_active = 1
               WHERE 1=1`
    const params = []

    if (q) { sql += ' AND (up.display_name LIKE ? OR up.name LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }
    if (age_min) { sql += ' AND up.age >= ?'; params.push(parseInt(age_min)) }
    if (age_max) { sql += ' AND up.age <= ?'; params.push(parseInt(age_max)) }
    if (city && city !== 'Все') { sql += ' AND up.city = ?'; params.push(city) }
    if (gender && gender !== 'all') { sql += ' AND up.gender = ?'; params.push(gender) }
    if (goal && goal !== 'all') { sql += ' AND up.dating_goal = ?'; params.push(goal) }

    sql += having
    sql += ' ORDER BY up.online DESC, up.last_seen DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    const [rows] = await pool.query(sql, params)
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM user_profiles up JOIN users u ON u.id = up.id WHERE u.is_active = 1',
    )

    res.json({ users: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ message: 'Failed to search users' })
  }
})

router.get('/api/users/top', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, display_name, name, age, avatar_url, city, online, matches_count
       FROM user_profiles
       WHERE matches_count > 0
       ORDER BY matches_count DESC
       LIMIT 4`,
    )
    res.json(rows)
  } catch (err) {
    console.error('Top users error:', err)
    res.status(500).json({ message: 'Failed to fetch top users' })
  }
})

router.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT up.*, u.email FROM user_profiles up
       JOIN users u ON u.id = up.id
       WHERE up.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' })

    const [photos] = await pool.query(
      'SELECT id, url, sort_order, is_avatar FROM user_photos WHERE user_id = ? ORDER BY sort_order',
      [req.params.id],
    )
    const [interests] = await pool.query(
      `SELECT i.name_en as slug FROM interests i
       JOIN user_interests ui ON ui.interest_id = i.id
       WHERE ui.user_id = ?`,
      [req.params.id],
    )

    res.json({ ...rows[0], photos, interests })
  } catch (err) {
    console.error('User GET error:', err)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

export default router
