import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

app.use(compression())

app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`JalSetu server running on port ${PORT}`)
  console.log(`Open http://localhost:${PORT} in your browser`)
})