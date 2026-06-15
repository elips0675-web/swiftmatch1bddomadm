import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import { getBannedWords, containsBannedWord } from './banned-words.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

let io

export function getIO() { return io }

export function setupWebSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.userId

    await pool.query('UPDATE user_profiles SET online = 1 WHERE id = ?', [userId])
    socket.join(`user:${userId}`)

    const [chats] = await pool.query(
      `SELECT chat_id FROM chat_participants WHERE user_id = ?`,
      [userId],
    )
    chats.forEach(c => socket.join(`chat:${c.chat_id}`))

    const [unreadRows] = await pool.query(
      'SELECT id, type, payload, created_at FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC LIMIT 10',
      [userId],
    )
    if (unreadRows.length > 0) {
      socket.emit('notification:unread', unreadRows)
    }

    socket.broadcast.emit('user:online', { userId })

    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on('chat:message', async (data) => {
      const { chatId, text, replyTo } = data
      if (!text || !chatId) return

      const bannedWords = await getBannedWords()
      if (containsBannedWord(text, bannedWords)) {
        socket.emit('chat:error', { message: 'Message contains prohibited content' })
        return
      }

      const [participant] = await pool.query(
        'SELECT chat_id FROM chat_participants WHERE chat_id = ? AND user_id = ?',
        [chatId, userId],
      )
      if (participant.length === 0) return

      const [result] = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, text, reply_to) VALUES (?, ?, ?, ?)',
        [chatId, userId, text, replyTo || null],
      )
      await pool.query(
        'UPDATE chats SET last_message = ?, last_sender_id = ?, updated_at = NOW() WHERE id = ?',
        [text, userId, chatId],
      )

      const [[message]] = await pool.query(
        `SELECT m.id, m.chat_id, m.sender_id, m.text, m.reply_to, m.created_at,
                up.display_name as sender_name
         FROM messages m
         JOIN user_profiles up ON m.sender_id = up.id
         WHERE m.id = ?`,
        [result.insertId],
      )

      socket.to(`chat:${chatId}`).emit('chat:message', message)

      const [participants] = await pool.query(
        'SELECT user_id FROM chat_participants WHERE chat_id = ? AND user_id != ?',
        [chatId, userId],
      )
      participants.forEach(p => {
        io.to(`user:${p.user_id}`).emit('chat:new', { chatId, last_message: text, sender_id: userId })
      })
    })

    socket.on('chat:typing', ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { chatId, userId, isTyping })
    })

    socket.on('disconnect', async () => {
      socket.broadcast.emit('user:offline', { userId })
      const connectedSockets = await io.in(`user:${userId}`).fetchSockets()
      if (connectedSockets.length === 0) {
        await pool.query('UPDATE user_profiles SET online = 0 WHERE id = ?', [userId])
      }
    })
  })

  return io
}
