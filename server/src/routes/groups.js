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

router.get('/api/groups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.id, g.name, g.description, g.category, g.avatar_url, g.member_count,
              g.created_at
       FROM chat_groups g
       ORDER BY g.member_count DESC`,
    )

    const groups = rows.map(g => ({
      id: g.id,
      name_ru: g.name,
      name_en: g.name,
      description_ru: g.description,
      description_en: g.description,
      img: g.avatar_url || '',
      onlineCount: Math.floor(Math.random() * 50) + 10,
      members: g.member_count,
    }))

    res.json(groups)
  } catch (err) {
    console.error('Groups error:', err)
    res.status(500).json({ message: 'Failed to fetch groups' })
  }
})

router.get('/api/groups/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.* FROM chat_groups g WHERE g.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Group not found' })

    const [members] = await pool.query(
      `SELECT up.id, up.display_name, up.avatar_url, up.online
       FROM chat_participants cp
       JOIN user_profiles up ON up.id = cp.user_id
       WHERE cp.chat_id = (SELECT id FROM chats WHERE group_id = ? LIMIT 1)
       LIMIT 50`,
      [req.params.id],
    )

    res.json({ ...rows[0], members })
  } catch (err) {
    console.error('Group detail error:', err)
    res.status(500).json({ message: 'Failed to fetch group' })
  }
})

export default router
