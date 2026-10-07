import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { deployTimeweb } from './deploy-timeweb.mjs'

function execute(command, args, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(command, args, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message))
      else resolve(stdout)
    })
    child.stdin.on('error', () => {})
    child.stdin.end(input)
  })
}

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'medved-deploy-')))
  t.after(() => rm(root, { recursive: true, force: true }))
  const source = path.join(root, 'dist')
  const destination = path.join(root, 'site/public_html')
  const manifest = path.join(root, 'site/.medved-deploy-manifest.json')
  await mkdir(source, { recursive: true })
  await mkdir(destination, { recursive: true })
  const put = async (directory, file, content = file) => {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true })
    await writeFile(path.join(directory, file), content)
  }
  await put(source, 'index.html', '<html>new site</html>')
  await put(source, '.htaccess', 'RewriteEngine On')
  let uploads = 0
  const run = async (command, args, input) => {
    if (command === 'ssh') {
      assert.equal(args.at(-1), 'sh -s')
      assert.ok(args.includes('StrictHostKeyChecking=yes'))
      return execute('sh', ['-s'], input)
    }
    assert.equal(command, 'rsync')
    assert.ok(!args.some((arg) => arg.startsWith('--delete')))
    uploads++
    // Реальный rsync с теми же флагами, но локальным приёмником вместо SSH.
    return execute('rsync', [...args.slice(0, 2), args.at(-2), `${destination}/`])
  }
  const config = { host: 'example.com', user: 'deploy', source, destination }
  const savePrevious = (files) => writeFile(manifest, JSON.stringify({ version: 1, files }))
  return { root, source, destination, manifest, put, run, config, savePrevious, uploads: () => uploads }
}

test('first publication preserves untracked server files and creates a private manifest', async (t) => {
  const f = await fixture(t)
  await f.put(f.destination, 'uploads/customer.pdf', 'customer data')
  await f.put(f.destination, 'old-page/index.html', 'untracked old page')
  await f.put(f.destination, 'api/settings.php', 'server config')
  const result = await deployTimeweb(f.config, f.run)
  assert.equal(result.removed, 0)
  for (const file of ['uploads/customer.pdf', 'old-page/index.html', 'api/settings.php']) {
    assert.ok(await readFile(path.join(f.destination, file), 'utf8'))
  }
  assert.equal(await readFile(path.join(f.destination, 'index.html'), 'utf8'), '<html>new site</html>')
  assert.deepEqual(JSON.parse(await readFile(f.manifest, 'utf8')).files, ['.htaccess', 'index.html'])
  await assert.rejects(readFile(path.join(f.destination, '.medved-deploy-manifest.json')), { code: 'ENOENT' })
})

test('next publication removes only obsolete tracked files and keeps current files', async (t) => {
  const f = await fixture(t)
  await f.put(f.source, 'assets/old.js')
  await f.put(f.source, 'retired/index.html')
  await deployTimeweb(f.config, f.run)
  await rm(path.join(f.source, 'assets/old.js'))
  await rm(path.join(f.source, 'retired'), { recursive: true })
  await f.put(f.source, 'assets/new.js')
  await f.put(f.destination, 'assets/manual.txt', 'keep me')
  const result = await deployTimeweb(f.config, f.run)
  assert.equal(result.removed, 2)
  for (const file of ['assets/old.js', 'retired/index.html']) {
    await assert.rejects(readFile(path.join(f.destination, file)), { code: 'ENOENT' })
  }
  assert.equal(await readFile(path.join(f.destination, 'assets/manual.txt'), 'utf8'), 'keep me')
  assert.equal(await readFile(path.join(f.destination, 'assets/new.js'), 'utf8'), 'assets/new.js')
  assert.deepEqual(JSON.parse(await readFile(f.manifest, 'utf8')).files, ['.htaccess', 'assets/new.js', 'index.html'])
})

test('failed upload preserves obsolete files and the previous manifest', async (t) => {
  const f = await fixture(t)
  await f.put(f.destination, 'assets/old.js')
  await f.savePrevious(['assets/old.js'])
  const before = await readFile(f.manifest, 'utf8')
  await assert.rejects(deployTimeweb(f.config, (command, args, input) => {
    if (command === 'rsync') throw new Error('Upload failed')
    return f.run(command, args, input)
  }), /Upload failed/)
  assert.equal(await readFile(f.manifest, 'utf8'), before)
  assert.ok(await readFile(path.join(f.destination, 'assets/old.js')))
})

test('malformed manifests and traversal paths stop before uploading or deleting', async (t) => {
  const f = await fixture(t)
  await f.put(f.root, 'private.txt', 'private data')
  for (const contents of ['invalid json', '{"version":2,"files":[]}',
    '{"version":1,"files":["../../private.txt"]}', '{"version":1,"files":["/private.txt"]}']) {
    await writeFile(f.manifest, contents)
    await assert.rejects(deployTimeweb(f.config, f.run))
  }
  assert.equal(f.uploads(), 0)
  assert.equal(await readFile(path.join(f.root, 'private.txt'), 'utf8'), 'private data')
})

test('symlinks in stale or destination paths cannot reach server data', async (t) => {
  const f = await fixture(t)
  await f.put(f.root, 'private/data.txt', 'private data')
  await symlink(path.join(f.root, 'private'), path.join(f.destination, 'linked'))
  await f.savePrevious(['linked/data.txt'])
  await assert.rejects(deployTimeweb(f.config, f.run), /symlink/)
  await f.savePrevious([])
  await f.put(f.source, 'linked/data.txt', 'replacement')
  await assert.rejects(deployTimeweb(f.config, f.run), /symlink/)
  assert.equal(f.uploads(), 0)
  assert.equal(await readFile(path.join(f.root, 'private/data.txt'), 'utf8'), 'private data')
})

test('cleanup refuses directories and retains its manifest for retry', async (t) => {
  const f = await fixture(t)
  await f.put(f.destination, 'was-a-file/customer.txt', 'customer data')
  await f.savePrevious(['was-a-file'])
  const before = await readFile(f.manifest, 'utf8')
  await assert.rejects(deployTimeweb(f.config, f.run), /Refusing to delete a directory/)
  assert.equal(await readFile(f.manifest, 'utf8'), before)
  assert.equal(await readFile(path.join(f.destination, 'was-a-file/customer.txt'), 'utf8'), 'customer data')
})

test('invalid destination and incomplete builds stop before remote access', async (t) => {
  const f = await fixture(t)
  const unexpected = () => { throw new Error('Unexpected remote access') }
  for (const destination of ['/', 'relative/public_html', '/site/../public_html', '/site//public_html']) {
    await assert.rejects(deployTimeweb({ ...f.config, destination }, unexpected), /TIMEWEB_PATH|Unsafe deployment/)
  }
  await rm(path.join(f.source, 'index.html'))
  await assert.rejects(deployTimeweb(f.config, unexpected), /Missing or empty build/)
})
