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

router.get('/api/contest/entries', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ce.id, ce.user_id, ce.photo_url, ce.gender, ce.votes, ce.rank,
              up.display_name AS user_name
       FROM contest_entries ce
       JOIN user_profiles up ON up.id = ce.user_id
       ORDER BY ce.votes DESC
       LIMIT 50`,
    )
    res.json(rows)
  } catch (err) {
    console.error('Contest entries error:', err)
    res.status(500).json({ message: 'Failed to fetch entries' })
  }
})

router.get('/api/contest/past-winners', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cw.id, cw.user_id, cw.photo_url, cw.month,
              up.display_name AS user_name
       FROM contest_winners cw
       JOIN user_profiles up ON up.id = cw.user_id
       ORDER BY cw.month DESC
       LIMIT 6`,
    )
    res.json(rows)
  } catch (err) {
    console.error('Past winners error:', err)
    res.status(500).json({ message: 'Failed to fetch past winners' })
  }
})

router.post('/api/contest/vote', auth, async (req, res) => {
  const { entry_id } = req.body
  if (!entry_id) return res.status(400).json({ message: 'entry_id is required' })

  try {
    const [entries] = await pool.query('SELECT id, user_id FROM contest_entries WHERE id = ?', [entry_id])
    if (entries.length === 0) return res.status(404).json({ message: 'Entry not found' })
    if (entries[0].user_id === req.userId) return res.status(400).json({ message: 'Cannot vote for yourself' })

    await pool.query('UPDATE contest_entries SET votes = votes + 1 WHERE id = ?', [entry_id])

    const [[updated]] = await pool.query('SELECT id, votes FROM contest_entries WHERE id = ?', [entry_id])
    res.json({ message: 'Vote recorded', votes: updated.votes })
  } catch (err) {
    console.error('Vote error:', err)
    res.status(500).json({ message: 'Failed to vote' })
  }
})

export default router
