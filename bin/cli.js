#!/usr/bin/env node

import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import open from 'open'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

let port = parseInt(process.argv[2]) || 3333

const server = createServer((req, res) => {
  let filePath = join(ROOT, req.url === '/' ? 'index.html' : req.url)

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // Handle directory requests
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }

  const ext = extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  try {
    const content = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404)
      res.end('Not Found')
    } else {
      res.writeHead(500)
      res.end('Server Error')
    }
  }
})

function startServer(p) {
  server.listen(p, () => {
    const url = `http://localhost:${p}`
    console.log(`
  ╭─────────────────────────────────────╮
  │                                     │
  │   Solid Chat running at:            │
  │   ${url.padEnd(30)}│
  │                                     │
  │   Press Ctrl+C to stop              │
  │                                     │
  ╰─────────────────────────────────────╯
`)
    open(url)
  })
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} in use, trying ${port + 1}...`)
    port++
    startServer(port)
  } else {
    console.error('Server error:', err.message)
    process.exit(1)
  }
})

startServer(port)
