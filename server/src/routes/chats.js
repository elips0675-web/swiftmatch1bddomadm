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

router.get('/api/chats', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.is_group, c.name, c.avatar_url, c.last_message, c.last_sender_id, c.updated_at,
              up.display_name AS last_sender_name
       FROM chat_participants cp
       JOIN chats c ON c.id = cp.chat_id
       LEFT JOIN user_profiles up ON up.id = c.last_sender_id
       WHERE cp.user_id = ?
       ORDER BY c.updated_at DESC`,
      [req.userId],
    )

    const chats = await Promise.all(rows.map(async (chat) => {
      const [participants] = await pool.query(
        `SELECT up.id, up.display_name, up.avatar_url, up.online
         FROM chat_participants cp
         JOIN user_profiles up ON up.id = cp.user_id
         WHERE cp.chat_id = ? AND cp.user_id != ?`,
        [chat.id, req.userId],
      )
      return { ...chat, participants }
    }))

    res.json(chats)
  } catch (err) {
    console.error('Chats error:', err)
    res.status(500).json({ message: 'Failed to fetch chats' })
  }
})

router.get('/api/chats/:id/messages', auth, async (req, res) => {
  try {
    const [participant] = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = ? AND user_id = ?',
      [req.params.id, req.userId],
    )
    if (participant.length === 0) return res.status(403).json({ message: 'Not a participant' })

    const [rows] = await pool.query(
      `SELECT m.id, m.chat_id, m.sender_id, m.text, m.reply_to, m.created_at,
              up.display_name AS sender_name, up.avatar_url AS sender_avatar
       FROM messages m
       JOIN user_profiles up ON up.id = m.sender_id
       WHERE m.chat_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [req.params.id],
    )

    res.json(rows)
  } catch (err) {
    console.error('Messages error:', err)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

export default router
