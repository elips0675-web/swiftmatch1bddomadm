import { Router } from 'express'
import pool from '../../db.js'

const router = Router()

async function sendEmails(subject, body, target) {
  try {
    const { default: nodemailer } = await import('nodemailer')
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    if (!smtpHost || !smtpUser) {
      console.log('SMTP not configured — email dispatch skipped')
      return { delivered: 0, total: 0 }
    }

    const where = target === 'all' ? '1=1' : target === 'active' ? 'u.is_active = 1' : '1=1'
    const [users] = await pool.query(
      `SELECT u.email FROM users u WHERE ${where} AND u.email IS NOT NULL LIMIT 100`,
    )
    if (users.length === 0) return { delivered: 0, total: 0 }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: (smtpPort || '587') === '465',
      auth: { user: smtpUser, pass: smtpPass },
    })

    let delivered = 0
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: smtpUser,
          to: user.email,
          subject,
          text: body,
          html: body.replace(/\n/g, '<br/>'),
        })
        delivered++
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err)
      }
    }
    return { delivered, total: users.length }
  } catch (err) {
    console.error('Email dispatch error:', err)
    return { delivered: 0, total: 0 }
  }
}

router.get('/campaigns', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, body, target, channel, status,
              DATE_FORMAT(created_at, '%Y-%m-%d') as sentAt,
              delivered, opened, clicked
       FROM campaigns
       ORDER BY created_at DESC`,
    )
    res.json(rows)
  } catch (err) {
    console.error('Campaigns error:', err)
    res.status(500).json({ message: 'Failed to fetch campaigns' })
  }
})

router.post('/campaigns', async (req, res) => {
  const { title, body, target, channel } = req.body
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body required' })
  }
  try {
    let delivered = 0, total = 0
    if (channel === 'email') {
      const result = await sendEmails(title, body, target)
      delivered = result.delivered
      total = result.total
    }

    const [result] = await pool.query(
      `INSERT INTO campaigns (title, body, target, channel, admin_id, status, delivered, opened, clicked)
       VALUES (?, ?, ?, ?, ?, 'sent', ?, 0, 0)`,
      [title, body, target || 'all', channel || 'push', req.admin?.id || 0, delivered],
    )
    res.status(201).json({ id: result.insertId, message: `Campaign sent (${delivered}/${total} delivered)` })
  } catch (err) {
    console.error('Create campaign error:', err)
    res.status(500).json({ message: 'Failed to create campaign' })
  }
})

export default router
