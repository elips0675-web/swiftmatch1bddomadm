import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/api/contest/entries', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ce.id, ce.user_id, ce.photo_url, ce.gender, ce.votes, ce.rank,
              up.display_name AS user_name
       FROM contest_entries ce
       JOIN user_profiles up ON up.id = ce.user_id
       WHERE ce.contest_month = DATE_FORMAT(NOW(), '%Y-%m')
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

export default router
