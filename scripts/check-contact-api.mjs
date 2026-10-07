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
const limiterFile = path.join(root, '.medved-contact-rate-limit.json')
const servers = []

try {
  await mkdir(path.join(publicDirectory, 'api'), { recursive: true })
  await copyFile('public/api/contact.php', path.join(publicDirectory, 'api/contact.php'))
  // Подмена системного sendmail исключает настоящую отправку писем во всех тестах.
  const sendmail = path.join(root, 'sendmail')
  await writeFile(sendmail, '#!/bin/sh\nif test -f "$CONTACT_TEST_MAIL_FAILURE"; then exit 1; fi\ncat >> "$CONTACT_TEST_MAIL_FILE"\n', { mode: 0o700 })

  async function startServer() {
    const socket = createServer()
    await new Promise((resolve, reject) => {
      socket.once('error', reject)
      socket.listen(0, '127.0.0.1', resolve)
    })
    const { port } = socket.address()
    await new Promise(resolve => socket.close(resolve))
    const endpoint = `http://127.0.0.1:${port}/api/contact.php`
    const quote = value => `'${value.replaceAll("'", "'\\''")}'`
    // Проверяем, что API защищает JSON даже при настройках среды для разработки.
    const server = spawn('php', [
      '-d', 'display_errors=1', '-d', 'log_errors=0', '-d', 'error_reporting=E_ALL',
      '-d', `error_log=${errorLog}`, '-d', `sendmail_path=${quote(sendmail)}`,
      '-S', `127.0.0.1:${port}`, '-t', publicDirectory,
    ], {
      stdio: 'ignore',
      env: { ...process.env, CONTACT_TEST_MAIL_FILE: mailFile, CONTACT_TEST_MAIL_FAILURE: mailFailure },
    })
    let startupError
    server.once('error', error => { startupError = error })
    const closed = new Promise(resolve => server.once('close', resolve))
    servers.push({ server, closed })
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (startupError) throw new Error(`Не удалось запустить PHP: ${startupError.message}`)
      try {
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(1000) })
        assert.equal(response.status, 405)
        assert.equal(response.headers.get('allow'), 'POST')
        return endpoint
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    throw new Error('PHP test server did not start')
  }
  const endpoint = await startServer()
  async function request(body, { contentType = 'application/json', headers = {}, target = endpoint } = {}) {
    return fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': contentType, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })
  }

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
  assert.equal((await stat(limiterFile)).mode & 0o777, 0o600)
  assert.ok(!(await readFile(limiterFile, 'utf8')).includes('127.0.0.1'))

  for (const cookie of [undefined, 'PHPSESSID=first-session', 'PHPSESSID=second-session']) {
    const headers = cookie ? { Cookie: cookie } : {}
    const response = await expectStatus(valid, 429, { headers })
    assert.ok(Number(response.headers.get('retry-after')) > 0)
  }
  await expectStatus(valid, 429, { headers: { 'X-Forwarded-For': '192.0.2.1', 'X-Real-IP': '192.0.2.2' } })
  assert.equal(await readFile(mailFile, 'utf8'), firstMail)

  // Состояние фикстуры позволяет проверить истечение лимита без ожидания в тестах.
  const limits = JSON.parse(await readFile(limiterFile, 'utf8'))
  for (const key of Object.keys(limits)) limits[key] = Math.floor(Date.now() / 1000) - 11
  await writeFile(limiterFile, JSON.stringify(limits))
  // Отдельные PHP-процессы обращаются к общему файлу действительно параллельно.
  const endpoints = [endpoint, await startServer(), await startServer()]
  const concurrent = await Promise.all(Array.from({ length: 6 }, (_, index) => request(valid, { target: endpoints[index % endpoints.length] })))
  assert.deepEqual(concurrent.map(response => response.status).sort(), [200, 429, 429, 429, 429, 429])
  for (const response of concurrent) await response.json()

  await writeFile(limiterFile, '{}')
  await expectStatus({ ...valid, phone: '8 (123) 456-78-90', email: '', message: '' }, 200)
  const messages = await readFile(mailFile, 'utf8')
  assert.equal((messages.match(/Телефон: 71234567890/g) || []).length, 3)
  assert.equal((messages.match(/Reply-To:/g) || []).length, 2)
  await writeFile(limiterFile, '{}')
  await writeFile(mailFailure, '')
  await expectStatus(valid, 500)
  assert.ok((await readFile(errorLog, 'utf8')).includes('Contact API: mail() failed'))
  await expectStatus(valid, 429)
  await rm(mailFailure)
  await writeFile(limiterFile, 'invalid-json')
  await expectStatus(valid, 503)
  // Каталог вместо файла вызывает реальный отказ fopen(), предупреждение должно уйти в журнал.
  await rm(limiterFile)
  await mkdir(limiterFile)
  await expectStatus(valid, 503)
  const diagnostics = await readFile(errorLog, 'utf8')
  assert.ok(diagnostics.includes('fopen('))
  for (const value of [valid.name, valid.phone, valid.email, valid.message]) {
    assert.ok(!diagnostics.includes(value), 'Журнал не должен содержать данные формы')
  }
  console.log('Проверки формы пройдены: валидация, отправка, лимит независимо от cookies, истечение лимита, ошибки почты/хранилища и журналирование без нарушения JSON.')
} finally {
  for (const { server } of servers) server.kill()
  await Promise.all(servers.map(({ closed }) => closed))
  await rm(root, { recursive: true, force: true })
}
