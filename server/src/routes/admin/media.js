import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads')

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })

const router = Router()

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function getFileType(ext) {
  const img = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i
  const doc = /\.(pdf|doc|docx|txt|csv|json|xml)$/i
  const video = /\.(mp4|webm|ogg|mov)$/i
  if (img.test(ext)) return 'image'
  if (doc.test(ext)) return 'document'
  if (video.test(ext)) return 'video'
  return 'other'
}

router.get('/media', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR)
    const items = files
      .filter(f => !f.startsWith('.'))
      .map(f => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f))
        const ext = path.extname(f).toLowerCase()
        return {
          name: f,
          url: '/uploads/' + f,
          size: formatSize(stat.size),
          sizeBytes: stat.size,
          type: getFileType(ext),
          ext: ext.replace('.', ''),
          modified: stat.mtime,
        }
      })
      .sort((a, b) => b.modified - a.modified)

    res.json({ files: items, total: items.length })
  } catch (err) {
    console.error('Media list error:', err)
    res.status(500).json({ message: 'Failed to list media' })
  }
})

router.post('/media/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const ext = path.extname(req.file.originalname).toLowerCase()
    res.json({
      name: req.file.filename,
      url: '/uploads/' + req.file.filename,
      size: formatSize(req.file.size),
      type: getFileType(ext),
    })
  } catch (err) {
    console.error('Media upload error:', err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

router.delete('/media/:filename', (req, res) => {
  try {
    const filePath = path.join(UPLOAD_DIR, req.params.filename)
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' })
    fs.unlinkSync(filePath)
    res.json({ message: 'File deleted' })
  } catch (err) {
    console.error('Media delete error:', err)
    res.status(500).json({ message: 'Delete failed' })
  }
})

export default router
