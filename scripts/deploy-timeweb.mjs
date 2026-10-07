import { execFile } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const manifestName = '.medved-deploy-manifest.json'
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`

function validateFile(file) {
  if (typeof file !== 'string' || !file.split('/').every((part) =>
    /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..')) {
    throw new Error(`Unsafe deployment file: ${JSON.stringify(file)}`)
  }
  return file
}

async function listFiles(directory, prefix = '') {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = validateFile(`${prefix}${entry.name}`)
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), `${relative}/`))
    else if (entry.isFile()) files.push(relative)
    else throw new Error(`Deployment source must contain only regular files: ${relative}`)
  }
  return files.sort()
}

function runCommand(command, args, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(command, args, { maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(new Error(`${command} failed: ${stderr || error.message}`))
      else resolve(stdout)
    })
    child.stdin.on('error', () => {})
    child.stdin.end(input)
  })
}

// Проверяем каждый компонент пути: удаление через симлинк запрещено.
function assertNoSymlinks(target) {
  const parts = target.split('/').filter(Boolean)
  return parts.map((_, index) => {
    const current = `/${parts.slice(0, index + 1).join('/')}`
    return `test ! -L ${quote(current)} || { echo 'Deployment path contains a symlink' >&2; exit 1; }`
  }).join('\n')
}

export async function deployTimeweb({ host, user, destination, source = path.resolve('dist') }, run = runCommand) {
  if (!host || !/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(host)) throw new Error('Invalid TIMEWEB_HOST')
  if (!user || !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(user)) throw new Error('Invalid TIMEWEB_USER')
  if (typeof destination !== 'string' || !destination.startsWith('/') ||
    !destination.endsWith('/public_html')) throw new Error('TIMEWEB_PATH must be an absolute public_html path')
  validateFile(destination.slice(1))
  const files = await listFiles(source)
  for (const required of ['index.html', '.htaccess']) {
    if (!files.includes(required) || !(await stat(path.join(source, required))).size) {
      throw new Error(`Missing or empty build file: ${required}`)
    }
  }

  const manifestPath = path.posix.join(path.posix.dirname(destination), manifestName)
  const sshOptions = ['-i', path.join(os.homedir(), '.ssh/id_ed25519'),
    '-o', 'StrictHostKeyChecking=yes', '-o', 'BatchMode=yes']
  const remote = (script) => run('ssh', [...sshOptions, `${user}@${host}`, 'sh -s'], `set -eu\n${script}\n`)
  const previousText = await remote(`${assertNoSymlinks(manifestPath)}
if test -e ${quote(manifestPath)}; then
  test -f ${quote(manifestPath)}
  cat ${quote(manifestPath)}
else
  printf '%s' '{"version":1,"files":[]}'
fi`)
  const previous = JSON.parse(previousText)
  if (previous.version !== 1 || !Array.isArray(previous.files)) throw new Error('Invalid deployment manifest')
  previous.files.forEach(validateFile)
  const current = new Set(files)
  const stale = [...new Set(previous.files)].filter((file) => !current.has(file)).sort()
  const checkedPaths = [...new Set([...files, ...stale])].map((file) => path.posix.join(destination, file))
  await remote(`${assertNoSymlinks(destination)}
test -d ${quote(destination)}
${checkedPaths.map(assertNoSymlinks).join('\n')}`)

  await run('rsync', ['-az', '--delay-updates', '-e',
    `ssh ${sshOptions.map(quote).join(' ')}`, `${path.resolve(source)}/`, `${user}@${host}:${destination}/`])

  // При ошибке загрузки сюда не попадаем; при ошибке очистки старый список остаётся для повтора.
  const manifest = JSON.stringify({ version: 1, files })
  await remote(`${assertNoSymlinks(manifestPath)}
${stale.map((file) => assertNoSymlinks(path.posix.join(destination, file))).join('\n')}
${stale.map((file) => `if test -d ${quote(path.posix.join(destination, file))}; then echo 'Refusing to delete a directory' >&2; exit 1; fi`).join('\n')}
temporary=$(mktemp -d ${quote(`${manifestPath}.XXXXXX`)})
trap 'rm -f "$temporary/manifest"; rmdir "$temporary"' EXIT
printf '%s\\n' ${quote(manifest)} > "$temporary/manifest"
${stale.map((file) => `rm -f ${quote(path.posix.join(destination, file))}`).join('\n')}
mv "$temporary/manifest" ${quote(manifestPath)}`)
  return { uploaded: files.length, removed: stale.length, initialized: previous.files.length === 0 }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await deployTimeweb({ host: process.env.TIMEWEB_HOST, user: process.env.TIMEWEB_USER,
      destination: process.env.TIMEWEB_PATH })
    console.log(`Uploaded ${result.uploaded} files; removed ${result.removed} obsolete files.`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
