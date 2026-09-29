import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'

const socket = createServer()
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve))
const { port } = socket.address()
await new Promise((resolve) => socket.close(resolve))

const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'public'], { stdio: 'ignore' })
const endpoint = `http://127.0.0.1:${port}/api/contact.php`

async function request(body, contentType = 'application/json') {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
}

try {
  let ready = false
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(endpoint)
      ready = true
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  assert.ok(ready, 'PHP test server did not start')

  assert.equal((await request('{}', 'text/plain')).status, 415)
  assert.equal((await request('{')).status, 400)
  assert.equal((await request(JSON.stringify({ name: 'Тест', phone: '71234567890', consent: false }))).status, 422)
  const honeypot = await request(JSON.stringify({ website: 'bot.example' }))
  assert.equal(honeypot.status, 200)
  assert.equal((await honeypot.json()).ok, true)
} finally {
  server.kill()
}
