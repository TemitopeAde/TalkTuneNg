const WebSocket = require('ws')
const http = require('http')
const { setupWSConnection } = require('y-websocket/bin/utils')

const port = process.env.YJS_PORT || 1234
const host = process.env.YJS_HOST || 'localhost'

// Create HTTP server
const server = http.createServer()

// Create WebSocket server
const wss = new WebSocket.Server({
  server,
  // Optional: Add authentication/authorization here
  verifyClient: (info) => {
    // You can add authentication logic here
    // For now, allow all connections
    return true
  }
})

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection from:', req.socket.remoteAddress)

  // Set up the Yjs WebSocket connection
  setupWSConnection(ws, req, {
    // Optional: Add document persistence here
    // docName => Y.Doc - you can load/save documents from database
    gc: true // Enable garbage collection
  })

  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })
})

// Start the server
server.listen(port, host, () => {
  console.log(`Yjs WebSocket server running on ws://${host}:${port}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down Yjs server...')
  server.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Shutting down Yjs server...')
  server.close(() => {
    process.exit(0)
  })
})