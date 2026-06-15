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

// ─── My groups ────────────────────────────────────────────────
router.get('/api/groups/my', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.* FROM chat_groups g
       JOIN chats c ON c.group_id = g.id
       JOIN chat_participants cp ON cp.chat_id = c.id AND cp.user_id = ?
       WHERE c.is_group = 1
       ORDER BY g.name_ru`,
      [req.userId],
    )
    const groups = rows.map(g => ({
      id: g.id,
      name_ru: g.name,
      name_en: g.name,
      description_ru: g.description,
      description_en: g.description,
      img: g.img || '',
      onlineCount: g.online_count || 0,
      members: g.members_count || 0,
    }))
    res.json(groups)
  } catch (err) {
    console.error('My groups error:', err)
    res.status(500).json({ message: 'Failed to fetch my groups' })
  }
})

// ─── Create group ──────────────────────────────────────────────
router.post('/api/groups', auth, async (req, res) => {
  const { name, description, category_id } = req.body
  if (!name || !category_id) return res.status(400).json({ message: 'name and category_id are required' })

  try {
    const [result] = await pool.query(
      'INSERT INTO chat_groups (name_ru, name_en, description, category_id) VALUES (?, ?, ?, ?)',
      [name, name, description || '', Number(category_id)],
    )
    const groupId = result.insertId

    const [chatResult] = await pool.query(
      'INSERT INTO chats (is_group, group_id) VALUES (1, ?)',
      [groupId],
    )
    const chatId = chatResult.insertId

    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)',
      [chatId, req.userId],
    )
    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, req.userId],
    )
    await pool.query(
      'UPDATE chat_groups SET members_count = 1 WHERE id = ?',
      [groupId],
    )

    const [[group]] = await pool.query('SELECT * FROM chat_groups WHERE id = ?', [groupId])
    res.status(201).json({ ...group, chat_id: chatId })
  } catch (err) {
    console.error('Create group error:', err)
    res.status(500).json({ message: 'Failed to create group' })
  }
})

// ─── Join group ────────────────────────────────────────────────
router.post('/api/groups/:id/join', auth, async (req, res) => {
  try {
    const [groups] = await pool.query('SELECT id FROM chat_groups WHERE id = ?', [req.params.id])
    if (groups.length === 0) return res.status(404).json({ message: 'Group not found' })

    const [existing] = await pool.query(
      'SELECT group_id FROM group_members WHERE group_id = ? AND user_id = ?',
      [req.params.id, req.userId],
    )
    if (existing.length > 0) return res.status(409).json({ message: 'Already a member' })

    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [req.params.id, req.userId],
    )
    await pool.query(
      'UPDATE chat_groups SET members_count = members_count + 1 WHERE id = ?',
      [req.params.id],
    )

    const [chats] = await pool.query('SELECT id FROM chats WHERE group_id = ? AND is_group = 1', [req.params.id])
    if (chats.length > 0) {
      await pool.query(
        'INSERT IGNORE INTO chat_participants (chat_id, user_id) VALUES (?, ?)',
        [chats[0].id, req.userId],
      )
    }

    res.json({ message: 'Joined group', group_id: Number(req.params.id) })
  } catch (err) {
    console.error('Join group error:', err)
    res.status(500).json({ message: 'Failed to join group' })
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
