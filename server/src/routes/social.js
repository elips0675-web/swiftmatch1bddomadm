import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { getIO } from '../ws.js'

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

// ─── Search / Discovery ────────────────────────────────────────
router.get('/api/users/search', auth, async (req, res) => {
  const { gender, looking_for, age_min, age_max, city, interest } = req.query
  try {
    let sql = `SELECT DISTINCT up.id, up.display_name, up.name, up.age, up.gender, up.city, up.country, up.avatar_url, up.online, up.last_seen, up.dating_goal
               FROM user_profiles up WHERE up.id != ?`
    const params = [req.userId]

    if (gender) { sql += ' AND up.gender = ?'; params.push(gender) }
    if (looking_for) { sql += ' AND up.looking_for = ?'; params.push(looking_for) }
    if (age_min) { sql += ' AND up.age >= ?'; params.push(Number(age_min)) }
    if (age_max) { sql += ' AND up.age <= ?'; params.push(Number(age_max)) }
    if (city) { sql += ' AND up.city = ?'; params.push(city) }

    if (interest) {
      sql = `SELECT DISTINCT up.id, up.display_name, up.name, up.age, up.gender, up.city, up.country, up.avatar_url, up.online, up.last_seen, up.dating_goal
             FROM user_profiles up
             JOIN user_interests ui ON ui.user_id = up.id
             JOIN interests i ON i.id = ui.interest_id
             WHERE up.id != ? AND (i.name_ru = ? OR i.name_en = ?)`
      params.splice(0, params.length, req.userId, interest, interest)
    }

    sql += ' ORDER BY up.online DESC, up.last_seen DESC LIMIT 50'

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ message: 'Search failed' })
  }
})

// ─── Likes ─────────────────────────────────────────────────────
router.post('/api/likes', auth, async (req, res) => {
  const { liked_user_id, type } = req.body
  if (!liked_user_id) return res.status(400).json({ message: 'liked_user_id is required' })

  try {
    const likeType = type === 'super_like' ? 'super_like' : 'like'
    await pool.query(
      'INSERT IGNORE INTO likes (from_user_id, to_user_id, type) VALUES (?, ?, ?)',
      [req.userId, liked_user_id, likeType],
    )

    const [reciprocal] = await pool.query(
      'SELECT id FROM likes WHERE from_user_id = ? AND to_user_id = ?',
      [liked_user_id, req.userId],
    )

    let matched = false
    if (reciprocal.length > 0) {
      const [existing] = await pool.query(
        'SELECT id FROM matches WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
        [req.userId, liked_user_id, liked_user_id, req.userId],
      )
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO matches (user1_id, user2_id, matched) VALUES (?, ?, 1)',
          [Math.min(req.userId, liked_user_id), Math.max(req.userId, liked_user_id)],
        )
      }
      matched = true
    }

    const [notifResult] = await pool.query(
      'INSERT INTO notifications (user_id, type, payload) VALUES (?, ?, ?)',
      [liked_user_id, 'like', JSON.stringify({ from_user_id: req.userId, type: likeType })],
    )
    const io = getIO()
    if (io) {
      const [[notif]] = await pool.query('SELECT id, type, payload, created_at FROM notifications WHERE id = ?', [notifResult.insertId])
      io.to(`user:${liked_user_id}`).emit('notification:new', notif)
    }

    res.status(201).json({ message: matched ? 'It\'s a match!' : 'Like sent', matched })
  } catch (err) {
    console.error('Like error:', err)
    res.status(500).json({ message: 'Failed to send like' })
  }
})

// ─── Matches ───────────────────────────────────────────────────
router.get('/api/matches', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.id, m.created_at as matched_at, up.id as user_id, up.display_name, up.name, up.age, up.avatar_url, up.city, up.online
       FROM matches m
       JOIN user_profiles up ON up.id = CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END
       WHERE m.matched = 1 AND (m.user1_id = ? OR m.user2_id = ?)
       ORDER BY m.created_at DESC`,
      [req.userId, req.userId, req.userId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Matches error:', err)
    res.status(500).json({ message: 'Failed to fetch matches' })
  }
})

// ─── Invites ───────────────────────────────────────────────────
router.post('/api/invites', auth, async (req, res) => {
  const { invitee_id, type } = req.body
  if (!invitee_id || !type) return res.status(400).json({ message: 'invitee_id and type are required' })

  try {
    await pool.query(
      'INSERT INTO invites (sender_id, receiver_id, type, status) VALUES (?, ?, ?, ?)',
      [req.userId, invitee_id, type, 'pending'],
    )

    const [notifResult] = await pool.query(
      'INSERT INTO notifications (user_id, type, payload) VALUES (?, ?, ?)',
      [invitee_id, 'invite', JSON.stringify({ from_user_id: req.userId, type })],
    )
    const io = getIO()
    if (io) {
      const [[notif]] = await pool.query('SELECT id, type, payload, created_at FROM notifications WHERE id = ?', [notifResult.insertId])
      io.to(`user:${invitee_id}`).emit('notification:new', notif)
    }

    res.status(201).json({ message: 'Invite sent' })
  } catch (err) {
    console.error('Invite error:', err)
    res.status(500).json({ message: 'Failed to send invite' })
  }
})

router.get('/api/invites', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.type, i.status, i.created_at,
              up.display_name as sender_name, up.avatar_url as sender_avatar
       FROM invites i
       JOIN user_profiles up ON i.sender_id = up.id
       WHERE i.receiver_id = ?
       ORDER BY i.created_at DESC`,
      [req.userId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Invites fetch error:', err)
    res.status(500).json({ message: 'Failed to fetch invites' })
  }
})

router.put('/api/invites/:id/status', auth, async (req, res) => {
  const { status } = req.body
  if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ message: 'Invalid status' })

  try {
    await pool.query(
      'UPDATE invites SET status = ? WHERE id = ? AND receiver_id = ?',
      [status, req.params.id, req.userId],
    )
    res.json({ message: `Invite ${status}` })
  } catch (err) {
    console.error('Invite status error:', err)
    res.status(500).json({ message: 'Failed to update invite' })
  }
})

// ─── Chats ─────────────────────────────────────────────────────
router.get('/api/chats', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.last_message, c.last_sender_id, c.updated_at,
              up.display_name, up.avatar_url, up.online,
              cp.last_read_at
       FROM chats c
       JOIN chat_participants cp ON cp.chat_id = c.id AND cp.user_id = ?
       JOIN chat_participants other ON other.chat_id = c.id AND other.user_id != ?
       JOIN user_profiles up ON up.id = other.user_id
       WHERE c.is_group = 0
       ORDER BY c.updated_at DESC`,
      [req.userId, req.userId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Chats error:', err)
    res.status(500).json({ message: 'Failed to fetch chats' })
  }
})

router.post('/api/chats', auth, async (req, res) => {
  const { participant_id } = req.body
  if (!participant_id) return res.status(400).json({ message: 'participant_id is required' })

  try {
    const [existing] = await pool.query(
      `SELECT c.id FROM chats c
       JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = ?
       JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id = ?
       WHERE c.is_group = 0
       LIMIT 1`,
      [req.userId, participant_id],
    )
    if (existing.length > 0) return res.json({ id: existing[0].id, existing: true })

    const [result] = await pool.query('INSERT INTO chats (is_group) VALUES (0)')
    const chatId = result.insertId
    await pool.query('INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?), (?, ?)', [chatId, req.userId, chatId, participant_id])
    res.status(201).json({ id: chatId, existing: false })
  } catch (err) {
    console.error('Chat create error:', err)
    res.status(500).json({ message: 'Failed to create chat' })
  }
})

router.get('/api/chats/:chatId/messages', auth, async (req, res) => {
  try {
    const [participant] = await pool.query(
      'SELECT chat_id FROM chat_participants WHERE chat_id = ? AND user_id = ?',
      [req.params.chatId, req.userId],
    )
    if (participant.length === 0) return res.status(403).json({ message: 'Not a participant' })

    const [rows] = await pool.query(
      `SELECT m.id, m.sender_id, m.text, m.reply_to, m.created_at,
              up.display_name as sender_name
       FROM messages m
       JOIN user_profiles up ON m.sender_id = up.id
       WHERE m.chat_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [req.params.chatId],
    )
    res.json(rows)
  } catch (err) {
    console.error('Messages error:', err)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

router.post('/api/chats/:chatId/messages', auth, async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ message: 'Text is required' })

  try {
    const [participant] = await pool.query(
      'SELECT chat_id FROM chat_participants WHERE chat_id = ? AND user_id = ?',
      [req.params.chatId, req.userId],
    )
    if (participant.length === 0) return res.status(403).json({ message: 'Not a participant' })

    const [result] = await pool.query(
      'INSERT INTO messages (chat_id, sender_id, text) VALUES (?, ?, ?)',
      [req.params.chatId, req.userId, text],
    )

    await pool.query(
      `UPDATE chats SET last_message = ?, last_sender_id = ?, updated_at = NOW() WHERE id = ?`,
      [text, req.userId, req.params.chatId],
    )

    const [[msg]] = await pool.query(
      `SELECT id, sender_id, text, created_at FROM messages WHERE id = ?`,
      [result.insertId],
    )
    res.status(201).json(msg)
  } catch (err) {
    console.error('Message send error:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
})

export default router
