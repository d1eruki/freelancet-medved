import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'

const root = await mkdtemp(path.join(os.tmpdir(), 'medved-contact-'))
const publicDirectory = path.join(root, 'public')
const mailFile = path.join(root, 'mail.txt')
const mailFailure = path.join(root, 'mail-fails')
const errorLog = path.join(root, 'php-errors.log')
let server
let serverClosed

try {
  await mkdir(path.join(publicDirectory, 'api'), { recursive: true })
  await copyFile('public/api/contact.php', path.join(publicDirectory, 'api/contact.php'))
  // Подмена системного sendmail исключает настоящую отправку писем во всех тестах.
  const sendmail = path.join(root, 'sendmail')
  await writeFile(sendmail, '#!/bin/sh\nif test -f "$CONTACT_TEST_MAIL_FAILURE"; then exit 1; fi\ncat >> "$CONTACT_TEST_MAIL_FILE"\n', { mode: 0o700 })

  const socket = createServer()
  await new Promise((resolve, reject) => {
    socket.once('error', reject)
    socket.listen(0, '127.0.0.1', resolve)
  })
  const { port } = socket.address()
  await new Promise(resolve => socket.close(resolve))
  const endpoint = `http://127.0.0.1:${port}/api/contact.php`
  const quote = value => `'${value.replaceAll("'", "'\\''")}'`
  // Обработчик должен сам защитить JSON даже при настройках среды для разработки.
  server = spawn('php', [
    '-d', 'display_errors=1', '-d', 'log_errors=0', '-d', 'error_reporting=E_ALL',
    '-d', `error_log=${errorLog}`, '-d', `sendmail_path=${quote(sendmail)}`,
    '-S', `127.0.0.1:${port}`, '-t', publicDirectory,
  ], {
    stdio: 'ignore',
    env: { ...process.env, CONTACT_TEST_MAIL_FILE: mailFile, CONTACT_TEST_MAIL_FAILURE: mailFailure },
  })
  let startupError
  server.once('error', error => { startupError = error })
  serverClosed = new Promise(resolve => server.once('close', resolve))

  async function request(body, { contentType = 'application/json', headers = {} } = {}) {
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': contentType, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })
  }

  let ready = false
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (startupError) throw new Error(`Не удалось запустить PHP: ${startupError.message}`)
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(1000) })
      assert.equal(response.status, 405)
      assert.equal(response.headers.get('allow'), 'POST')
      ready = true
      break
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  assert.ok(ready, 'PHP test server did not start')

  const valid = { name: 'Тест', phone: '71234567890', email: 'test@example.com', message: 'Проверка формы', consent: true }
  async function expectStatus(body, status, options) {
    const response = await request(body, options)
    assert.equal(response.status, status, JSON.stringify(body))
    const result = await response.json()
    if (status === 200) assert.equal(result.ok, true)
    else assert.ok(typeof result.message === 'string' && result.message.length > 0)
    return response
  }

  for (const contentType of ['text/plain', 'application/json-invalid']) {
    await expectStatus('{}', 415, { contentType })
  }
  for (const body of ['{', 'null', '[]', '"text"', 'true', '123']) {
    await expectStatus(body, 400)
  }
  await expectStatus(' '.repeat(16385), 400)
  for (const field of ['name', 'phone', 'email', 'message', 'website']) {
    for (const value of [[], {}, null, 123, true]) {
      await expectStatus({ ...valid, [field]: value }, 422)
    }
  }
  for (const value of [false, 'true', 1, null, {}]) {
    await expectStatus({ ...valid, consent: value }, 422)
  }
  for (const name of ['', 'a'.repeat(121)]) await expectStatus({ ...valid, name }, 422)
  for (const phone of ['', '...', '+ () -', '123', '1234567890', '61234567890', '712345678901', '7\n1234567890', '7abc1234567890']) {
    await expectStatus({ ...valid, phone }, 422)
  }
  await expectStatus({ ...valid, email: 'invalid-email' }, 422)
  await expectStatus({ ...valid, message: 'a'.repeat(4001) }, 422)
  await expectStatus({ website: 'bot.example' }, 200)
  await assert.rejects(stat(mailFile), { code: 'ENOENT' })

  await expectStatus({ ...valid, phone: '+7 (123) 456-78-90' }, 200, { contentType: 'application/json; charset=utf-8' })
  const firstMail = await readFile(mailFile, 'utf8')
  assert.ok(firstMail.includes('Имя: Тест'))
  assert.ok(firstMail.includes('Телефон: 71234567890'))
  assert.ok(firstMail.includes('Reply-To: test@example.com'))
  await writeFile(mailFailure, '')
  await expectStatus(valid, 500)
  assert.ok((await readFile(errorLog, 'utf8')).includes('Contact API: mail() failed'))
  const diagnostics = await readFile(errorLog, 'utf8')
  for (const value of [valid.name, valid.phone, valid.email, valid.message]) {
    assert.ok(!diagnostics.includes(value), 'Журнал не должен содержать данные формы')
  }
  console.log('Проверки формы пройдены: валидация, отправка, ошибки почты и журналирование без нарушения JSON.')
} finally {
  if (server) {
    server.kill()
    await serverClosed
  }
  await rm(root, { recursive: true, force: true })
}
